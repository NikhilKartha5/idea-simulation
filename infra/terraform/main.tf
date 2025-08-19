terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

# Artifact bucket (kept from initial placeholder)
resource "aws_s3_bucket" "artifact_bucket" {
  bucket = var.artifact_bucket_name
}

# -----------------------------
# Networking
# -----------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "ideas-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "ideas-igw" }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  map_public_ip_on_launch = true
  availability_zone       = element(var.availability_zones, count.index)
  tags = { Name = "ideas-public-${count.index}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "ideas-public-rt" }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# -----------------------------
# Security Groups
# -----------------------------
resource "aws_security_group" "alb_sg" {
  name        = "ideas-alb-sg"
  description = "ALB ingress"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "ideas-alb-sg" }
}

resource "aws_security_group" "app_sg" {
  name        = "ideas-app-sg"
  description = "App instances"
  vpc_id      = aws_vpc.main.id
  ingress {
    description      = "ALB to gateway"
    from_port        = 8080
    to_port          = 8080
    protocol         = "tcp"
    security_groups  = [aws_security_group.alb_sg.id]
  }
  # Optional: expose frontend dev port if needed (5173) behind ALB not required
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "ideas-app-sg" }
}

# -----------------------------
# ECR Repositories (one per service)
# -----------------------------
locals {
  service_names = ["gateway", "frontend", "idea-service", "vote-service", "comment-service", "auth-service"]
}

resource "aws_ecr_repository" "services" {
  for_each             = toset(local.service_names)
  name                 = "ideas-${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  tags = { Service = each.key }
}

# -----------------------------
# Load Balancer
# -----------------------------
resource "aws_lb" "public" {
  name               = "ideas-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [for s in aws_subnet.public : s.id]
  idle_timeout       = 60
  tags = { Name = "ideas-alb" }
}

resource "aws_lb_target_group" "gateway" {
  name        = "ideas-gateway-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "8080"
  }
  tags = { Name = "ideas-gateway-tg" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.public.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway.arn
  }
}

# -----------------------------
# IAM Role for EC2 (ECR pull)
# -----------------------------
resource "aws_iam_role" "ec2_role" {
  name               = "ideas-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ideas-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# -----------------------------
# Launch Template & Auto Scaling Group
# -----------------------------
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  registry   = "${local.account_id}.dkr.ecr.${var.region}.amazonaws.com"
}

locals {
  image_tag = var.image_tag
}

resource "aws_launch_template" "app" {
  name_prefix   = "ideas-app-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  iam_instance_profile { name = aws_iam_instance_profile.ec2_profile.name }
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  user_data = base64encode(templatefile("${path.module}/userdata.sh.tftpl", {
    region      = var.region
    registry    = local.registry
    image_tag   = local.image_tag
    services    = local.service_names
  }))
  tag_specifications {
    resource_type = "instance"
    tags = { Name = "ideas-app" }
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_autoscaling_group" "app" {
  name                      = "ideas-asg"
  max_size                  = var.asg_max
  min_size                  = var.asg_min
  desired_capacity          = var.asg_desired
  vpc_zone_identifier       = [for s in aws_subnet.public : s.id]
  health_check_type         = "EC2"
  health_check_grace_period = 60
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
  target_group_arns = [aws_lb_target_group.gateway.arn]
  tag {
    key                 = "Name"
    value               = "ideas-app"
    propagate_at_launch = true
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "ideas-cpu-target"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification { predefined_metric_type = "ASGAverageCPUUtilization" }
    target_value = 50
  }
}


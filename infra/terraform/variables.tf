variable "region" { type = string default = "us-east-1" }
variable "artifact_bucket_name" { type = string default = "aha-ideas-artifacts-example" }

variable "vpc_cidr" { type = string default = "10.20.0.0/16" }
variable "public_subnet_cidrs" { type = list(string) default = ["10.20.1.0/24", "10.20.2.0/24"] }
variable "availability_zones" { type = list(string) default = ["us-east-1a", "us-east-1b"] }

variable "instance_type" { type = string default = "t3.micro" }
variable "asg_min" { type = number default = 1 }
variable "asg_max" { type = number default = 3 }
variable "asg_desired" { type = number default = 1 }

variable "image_tag" { type = string default = "latest" description = "Docker image tag pushed to ECR for all services" }

output "artifact_bucket" { value = aws_s3_bucket.artifact_bucket.id }
output "alb_dns_name" { value = aws_lb.public.dns_name }
output "vpc_id" { value = aws_vpc.main.id }
output "autoscaling_group_name" { value = aws_autoscaling_group.app.name }

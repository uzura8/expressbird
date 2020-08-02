output "security_group_alb_web" {
  value = aws_security_group.alb_web
}

output "security_group_fargate" {
  value = aws_security_group.fargate
}

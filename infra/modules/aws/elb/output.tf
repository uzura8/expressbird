output "security_group_alb_web" {
  value = aws_security_group.alb_web
}

output "lb_target_group_web_arn" {
  value = aws_lb_target_group.web.arn
}

output "lb_listener_rule_forward_obj" {
  value = aws_lb_listener_rule.forward
}


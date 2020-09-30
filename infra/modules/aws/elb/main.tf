variable "common_prefix" {}
variable "vpc_id" {}
variable "security_group_alb_web" {}
variable "subnet_public_a_web_id" {}
variable "subnet_public_b_web_id" {}
variable "health_check_path" {}
variable "route53_zone_id" {}
variable "domain_name" {}
#variable "ec2_web1_id" {}
#variable "ec2_web2_id" {}

# ALB
resource "aws_lb" "web" {
  name               = join("-", [var.common_prefix, "alb", "web"])
  internal           = false #false: for public internet / true: for private network
  load_balancer_type = "application"
  #idle_timeout       = 60

  security_groups = [
    var.security_group_alb_web.id
  ]

  subnets = [
    var.subnet_public_a_web_id,
    var.subnet_public_b_web_id,
  ]

  tags = {
    Name      = join("-", [var.common_prefix, "alb", "web"])
    ManagedBy = "terraform"
  }
}

# Target Group of ALB
resource "aws_lb_target_group" "web" {
  name        = join("-", [var.common_prefix, "alb", "tg", "web"])
  target_type = "ip"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  depends_on  = [aws_lb.web]

  health_check {
    interval            = "10"
    path                = var.health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = "4"
    healthy_threshold   = "2"
    unhealthy_threshold = "10"
    matcher             = "200-302"
    #port               = 80
  }

  tags = {
    Name      = join("-", [var.common_prefix, "alb", "tg", "web"])
    ManagedBy = "terraform"
  }
}

#resource "aws_lb_target_group_attachment" "web_a" {
#  target_group_arn = aws_lb_target_group.web.arn
#  target_id        = var.ec2_web1_id
#  port             = 80
#}

resource "aws_acm_certificate" "this" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  #subject_alternative_names = ["*.${var.domain_name}"]

  tags = {
    Name      = join("-", [var.common_prefix, "acm"])
    ManagedBy = "terraform"
  }
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}

#resource "aws_lb_target_group_attachment" "web_b" {
#  target_group_arn = aws_lb_target_group.web.arn
#  target_id        = var.ec2_web2_id
#  port             = 80
#}

# Listener of ALB
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.web.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.web.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2015-05"
  certificate_arn   = aws_acm_certificate.this.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

#resource "aws_lb_listener_rule" "forward" {
#  listener_arn = aws_lb_listener.web.arn
#  priority     = 99
#
#  action {
#    type             = "forward"
#    target_group_arn = aws_lb_target_group.web.arn
#  }
#
#  condition {
#    path_pattern {
#      values = ["/*"]
#    }
#  }
#}

resource "aws_route53_record" "elb" {
  zone_id = var.route53_zone_id
  type    = "A"
  name    = var.domain_name
  #name    = "hoge"

  alias {
    name                   = aws_lb.web.dns_name
    zone_id                = aws_lb.web.zone_id
    evaluate_target_health = "true"
  }
}


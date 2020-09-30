variable "common_prefix" {}
variable "vpc_id" {}

# Security gourp for ALB
resource "aws_security_group" "alb_web" {
  name        = join("-", [var.common_prefix, "sg", "alb_web"])
  description = "for ALB"
  vpc_id      = var.vpc_id

  tags = {
    Name      = join("-", [var.common_prefix, "sg", "alb_web"])
    ManagedBy = "terraform"
  }
}

# Security gourp for Fargate
resource "aws_security_group" "fargate" {
  name        = join("-", [var.common_prefix, "sg", "fargate"])
  description = "for Fargate"
  vpc_id      = var.vpc_id

  tags = {
    Name      = join("-", [var.common_prefix, "sg", "fargate"])
    ManagedBy = "terraform"
  }
}

# Security gourp rule
resource "aws_security_group_rule" "allow_http_for_alb" {
  security_group_id = aws_security_group.alb_web.id
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "allow_http_for_alb"
}
resource "aws_security_group_rule" "allow_https_for_alb" {
  security_group_id = aws_security_group.alb_web.id
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "allow_https_for_alb"
}
resource "aws_security_group_rule" "egress_alb" {
  security_group_id = aws_security_group.alb_web.id
  type              = "egress"
  protocol          = "-1"
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Outbound ALL"
}
resource "aws_security_group_rule" "from_alb_to_fargate" {
  security_group_id        = aws_security_group.fargate.id
  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 80
  to_port                  = 80
  source_security_group_id = aws_security_group.alb_web.id
  description              = "from_alb_to_fargate"
}
resource "aws_security_group_rule" "egress_fargate" {
  security_group_id = aws_security_group.fargate.id
  type              = "egress"
  protocol          = "-1"
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Outbound ALL"
}

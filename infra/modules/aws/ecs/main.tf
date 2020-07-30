variable "ecs_service_task_desired_count" {}
variable "subnet_public_a_web_id" {}
variable "subnet_public_b_web_id" {}
variable "security_group_alb_web" {}
variable "lb_target_group_web_arn" {}
variable "lb_listener_rule_forward_obj" {}
variable "rds_endpoint" {}
variable "aws_db_password" {}
variable "app_session_key" {}
variable "common_prefix" {}

## account_id
data "aws_caller_identity" "self" {}

## task definition
data "template_file" "task" {
  template = file("data/task-definitions.json")

  vars = {
    account_id      = data.aws_caller_identity.self.account_id
    db_password     = var.aws_db_password
    app_session_key = var.app_session_key
    rds_endpoint    = var.rds_endpoint
  }
}

## Cluster
resource "aws_ecs_cluster" "app" {
  name = join("-", [var.common_prefix, "ecs", "cl"])
}

resource "aws_ecs_task_definition" "app" {
  #family                   = aws_ecs_cluster.app.name
  family                   = "gc-fargate2"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  task_role_arn            = join(":", ["arn:aws:iam:", data.aws_caller_identity.self.account_id, "role/gc-ecs-task-role"])
  execution_role_arn       = join(":", ["arn:aws:iam:", data.aws_caller_identity.self.account_id, "role/ecsTaskExecutionRole"])
  cpu                      = 512
  memory                   = 1024
  container_definitions    = data.template_file.task.rendered
}

resource "aws_ecs_service" "app" {
  depends_on                         = [var.lb_listener_rule_forward_obj]
  cluster                            = aws_ecs_cluster.app.id
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  desired_count                      = var.ecs_service_task_desired_count
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 60
  name                               = join("-", [var.common_prefix, "ecs", "srv"])

  task_definition = aws_ecs_task_definition.app.arn

  lifecycle {
    ignore_changes = [
      "desired_count",
      "task_definition",
    ]
  }

  network_configuration {
    assign_public_ip = false
    subnets = [
      var.subnet_public_a_web_id,
      var.subnet_public_b_web_id,
    ]

    security_groups = [
      var.security_group_alb_web.id,
    ]
  }

  load_balancer {
    target_group_arn = var.lb_target_group_web_arn
    container_name   = "gc-fargate2"
    container_port   = "80"
  }
}

resource "aws_cloudwatch_log_group" "ecs_app" {
  name = "/ecs/app"

  tags = {
    Environment = "pre"
    Application = "app"
  }
}

#resource "aws_iam_role" "gc-ecstaskexecution-role" {
#  name               = "ecsTaskExecutionRole"
#  assume_role_policy = file("data/assume_role_policy/ecs-task.json")
#}
#
#resource "aws_iam_role_policy_attachment" "gc-ecstaskexecutionrole-attach" {
#  role       = aws_iam_role.gc-ecstaskexecution-role.name
#  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
#}

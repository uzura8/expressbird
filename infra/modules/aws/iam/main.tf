variable "common_prefix" {}

# IAM Role
resource "aws_iam_role" "fargate_task" {
  name               = join("-", [var.common_prefix, "iam", "role", "fg", "task"])
  assume_role_policy = file("./data/roles/ecs-task.json")
}

resource "aws_iam_role" "fargate_task_execution" {
  name               = join("-", [var.common_prefix, "iam", "role", "fg", "task", "execution"])
  assume_role_policy = file("./data/roles/ecs-task-execution.json")
}

#resource "aws_iam_role" "codebuild_service_role" {
#  name               = join("-", [var.common_prefix, "iam", "role", "cb", "service"])
#  assume_role_policy = file("./data/roles/codebuild_assume_role.json")
#}
#
#resource "aws_iam_role" "codepipeline_service_role" {
#  name               = join("-", [var.common_prefix, "iam", "role", "cp", "service"])
#  assume_role_policy = file("./data/roles/codepipeline_assume_role.json")
#}

# IAM Role Policy
resource "aws_iam_role_policy" "fargate_task" {
  name   = join("-", [var.common_prefix, "iam", "policy", "fg", "task"])
  role   = aws_iam_role.fargate_task.name
  policy = file("./data/roles/fargate_task_policy.json")
}

resource "aws_iam_role_policy" "fargate_task_execution" {
  name   = join("-", [var.common_prefix, "iam", "policy", "fg", "task", "execution"])
  role   = aws_iam_role.fargate_task_execution.name
  policy = file("./data/roles/fargate_task_execution_policy.json")
}

#resource "aws_iam_role_policy" "codebuild_service_role" {
#  name   = join("-", [var.common_prefix, "iam", "policy", "cb", "service"])
#  role   = aws_iam_role.codebuild_service_role.name
#  policy = file("./data/roles/codebuild_build_policy.json")
#}
#
#resource "aws_iam_role_policy" "codepipeline_service_role" {
#  name   = join("-", [var.common_prefix, "iam", "policy", "cp", "service"])
#  role   = aws_iam_role.codepipeline_service_role.name
#  policy = file("./data/roles/codepipeline_pipeline_policy.json")
#}

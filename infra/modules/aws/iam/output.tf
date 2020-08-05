output "iam_role_fargate_task" {
  value = aws_iam_role.fargate_task.arn
}

output "iam_role_fargate_task_execution" {
  value = aws_iam_role.fargate_task_execution.arn
}


# General
common_prefix = "fggc-prod"

# VPC
vpc_availability_zones = ["ap-northeast-1c", "ap-northeast-1d"]

# ELB
elb_health_check_path = "/"

# RDS
aws_db_is_enabled          = 1
aws_db_is_enabled_multi_az = 0
aws_db_instance_type       = "db.t2.micro"
aws_db_block_volume_type   = "standard" # gp2 / io1 / standard
aws_db_allocated_storage   = "20"       # GB
aws_db_engine              = "mysql"
aws_db_engine_version      = "5.7.28"
aws_db_port                = "3306"
aws_db_name                = "gc_db" # Set this, if create db
aws_db_username            = "db_admin"

# ECS
ecs_service_task_desired_count = 2

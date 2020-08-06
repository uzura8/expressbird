variable "db_is_enabled" {}
variable "db_is_enabled_multi_az" {}
variable "vpc_id" {}
variable "vpc_cidr_block" {}
variable "subnet_group_db_name" {}
variable "db_instance_type" {}
variable "db_block_volume_type" {}
variable "db_allocated_storage" {}
variable "db_engine" {}
variable "db_engine_version" {}
variable "db_port" {}
variable "db_username" {}
variable "db_password" {}
variable "db_name" {}
variable "db_parameter_group_family" {}
variable "common_prefix" {}

resource "aws_security_group" "db" {
  name   = join("-", [var.common_prefix, "sg", "db"])
  vpc_id = var.vpc_id
  ingress {
    from_port   = var.db_port
    to_port     = var.db_port
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = join("-", [var.common_prefix, "sg", "db"])
    ManagedBy = "terraform"
  }
}

resource "aws_db_parameter_group" "db" {
  name        = join("-", [var.common_prefix, "pg", "db"])
  family      = var.db_parameter_group_family
  description = join(" ", ["mysql parameter group for", var.common_prefix])

  parameter {
    name         = "character-set-client-handshake"
    value        = "0"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "character_set_client"
    value        = "utf8mb4"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "character_set_connection"
    value        = "utf8mb4"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "character_set_database"
    value        = "utf8mb4"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "character_set_results"
    value        = "utf8mb4"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "character_set_server"
    value        = "utf8mb4"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "log_bin_trust_function_creators"
    value        = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "max_allowed_packet"
    value        = "10240000"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "skip-character-set-client-handshake"
    value        = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "innodb_large_prefix"
    value        = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "innodb_file_format"
    value        = "Barracuda"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "innodb_file_per_table"
    value        = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "init_connect"
    value        = "SET NAMES utf8mb4"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_instance" "db" {
  count                     = var.db_is_enabled
  identifier                = join("-", [var.common_prefix, "rds", "db"])
  allocated_storage         = var.db_allocated_storage
  storage_type              = var.db_block_volume_type
  engine                    = var.db_engine
  engine_version            = var.db_engine_version
  instance_class            = var.db_instance_type
  username                  = var.db_username
  password                  = var.db_password
  name                      = var.db_name != "" ? var.db_name : ""
  vpc_security_group_ids    = [aws_security_group.db.id]
  db_subnet_group_name      = var.subnet_group_db_name
  multi_az                  = var.db_is_enabled_multi_az == 1 ? true : false
  parameter_group_name      = aws_db_parameter_group.db.name
  backup_retention_period   = 1
  final_snapshot_identifier = false
  skip_final_snapshot       = true
  apply_immediately         = true
  #parameter_group_name   = "default.mysql5.7"

  tags = {
    Name      = join("-", [var.common_prefix, "rds", "db"])
    ManagedBy = "terraform"
  }
}


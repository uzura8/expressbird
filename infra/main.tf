provider "aws" {
}

terraform {
  backend "s3" {
  }
}

# VPC
module "module_vpc" {
  source             = "./modules/aws/vpc"
  availability_zones = var.vpc_availability_zones
  common_prefix      = var.common_prefix
}

# ELB
module "module_elb" {
  source                 = "./modules/aws/elb"
  vpc_id                 = module.module_vpc.vpc_id
  subnet_public_a_web_id = module.module_vpc.subnet_public_a_web_id
  subnet_public_b_web_id = module.module_vpc.subnet_public_b_web_id
  common_prefix          = var.common_prefix
  health_check_path      = var.elb_health_check_path
}

# RDS
module "module_rds" {
  source                 = "./modules/aws/rds"
  vpc_id                 = module.module_vpc.vpc_id
  vpc_cidr_block         = module.module_vpc.vpc_cidr_block
  subnet_group_db_name   = module.module_vpc.subnet_group_db_name
  db_is_enabled          = var.aws_db_is_enabled
  db_is_enabled_multi_az = var.aws_db_is_enabled_multi_az
  db_instance_type       = var.aws_db_instance_type
  db_allocated_storage   = var.aws_db_allocated_storage
  db_block_volume_type   = var.aws_db_block_volume_type
  db_engine              = var.aws_db_engine
  db_engine_version      = var.aws_db_engine_version
  db_port                = var.aws_db_port
  db_username            = var.aws_db_username
  db_password            = var.aws_db_password
  db_name                = var.aws_db_name
  common_prefix          = var.common_prefix
}

## Lambda
#module "module_lambda" {
#  source = "./modules/aws/lambda"
#}


variable "common_prefix" {}
variable "aws_db_is_enabled" {}
variable "aws_db_is_enabled_multi_az" {}
variable "aws_db_instance_type" {}
variable "aws_db_allocated_storage" {}
variable "aws_db_block_volume_type" {}
variable "aws_db_engine" {}
variable "aws_db_engine_version" {}
variable "aws_db_port" {}
variable "aws_db_username" {}
variable "aws_db_password" {}
variable "aws_db_name" {}
variable "vpc_availability_zones" {}
variable "elb_health_check_path" {}

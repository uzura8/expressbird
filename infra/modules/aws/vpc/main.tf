variable "common_prefix" {}
variable "availability_zones" {}

#data "aws_availability_zones" "available" {
#  state = "available"
#}


# VPC
resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  instance_tenancy     = "default"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name      = join("-", [var.common_prefix, "vpc"])
    ManagedBy = "terraform"
  }
}

# subnet for ELB1
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = var.availability_zones[0]
  map_public_ip_on_launch = true # accept to add public ip for instance

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "public_a"])
    ManagedBy = "terraform"
  }
}

# subnet for ELB2
resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.11.0/24"
  availability_zone       = var.availability_zones[1]
  map_public_ip_on_launch = true # accept to add public ip for instance

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "public_b"])
    ManagedBy = "terraform"
  }
}

# subnet for WEB1
resource "aws_subnet" "public_a_web" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.20.0/24"
  availability_zone       = var.availability_zones[0]
  map_public_ip_on_launch = true # accept to add public ip for instance

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "public_a_web"])
    ManagedBy = "terraform"
  }
}

# subnet for WEB2
resource "aws_subnet" "public_b_web" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.21.0/24"
  availability_zone       = var.availability_zones[1]
  map_public_ip_on_launch = true # accept to add public ip for instance

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "public_b_web"])
    ManagedBy = "terraform"
  }
}

# subnet for RDS1
resource "aws_subnet" "private_a" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.30.0/24"
  map_public_ip_on_launch = true # accept to add public ip for instance
  availability_zone       = var.availability_zones[0]

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "private_a"])
    ManagedBy = "terraform"
  }
}

# subnet for RDS2
resource "aws_subnet" "private_b" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.31.0/24"
  map_public_ip_on_launch = true # accept to add public ip for instance
  availability_zone       = var.availability_zones[1]

  tags = {
    Name      = join("-", [var.common_prefix, "subnet", "private_b"])
    ManagedBy = "terraform"
  }
}

# Route Table for ELB
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name      = join("-", [var.common_prefix, "rtb", "public"])
    ManagedBy = "terraform"
  }
}

# Route Table for web
resource "aws_route_table" "public_web" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name      = join("-", [var.common_prefix, "rtb", "public_web"])
    ManagedBy = "terraform"
  }
}

# Route Table for RDS
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name      = join("-", [var.common_prefix, "rtb", "private"])
    ManagedBy = "terraform"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name      = join("-", [var.common_prefix, "igw"])
    ManagedBy = "terraform"
  }
}

# NAT Gateway
resource "aws_eip" "ng" {
  vpc        = true
  depends_on = [aws_internet_gateway.this]

  tags = {
    Name      = join("-", [var.common_prefix, "eip", "ng"])
    ManagedBy = "terraform"
  }
}

resource "aws_nat_gateway" "ng" {
  allocation_id = aws_eip.ng.id
  subnet_id     = aws_subnet.public_a.id
  depends_on    = [aws_internet_gateway.this]

  tags = {
    Name      = join("-", [var.common_prefix, "ng"])
    ManagedBy = "terraform"
  }
}

# Route for ELB
resource "aws_route" "public" {
  route_table_id         = aws_route_table.public.id
  gateway_id             = aws_internet_gateway.this.id
  destination_cidr_block = "0.0.0.0/0"
  depends_on             = [aws_route_table.public]
}

# Route for WEB
resource "aws_route" "public_web" {
  route_table_id         = aws_route_table.public_web.id
  gateway_id             = aws_nat_gateway.ng.id
  destination_cidr_block = "0.0.0.0/0"
  depends_on             = [aws_route_table.public_web]
}

# Route Table for Private
resource "aws_route" "private" {
  destination_cidr_block = "0.0.0.0/0"
  route_table_id         = aws_route_table.private.id
  nat_gateway_id         = aws_nat_gateway.ng.id
}

# Associate subnet and route table
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_a_web" {
  subnet_id      = aws_subnet.public_a_web.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_b_web" {
  subnet_id      = aws_subnet.public_b_web.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}
resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

# network fro rds #
resource "aws_db_subnet_group" "private" {
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name      = join("-", [var.common_prefix, "subnets", "db"])
    ManagedBy = "terraform"
  }
}


#output "rds_endpoint" {
#  value = "${aws_db_instance.db.address}"
#}

output "rds_objs" {
  value = "${aws_db_instance.db}"
}

import subprocess
import json
import os


def main():
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    print('1. deploy infra')
    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstat',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_apply_cmd = ['terraform', 'apply', '-auto-approve']

    if os.path.exists('terraform.tfvars'):
        terraform_apply_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('aws_db_password=%s' % db_passwd)

    subprocess.run(terraform_apply_cmd, cwd='./infra', check=True)
    state = subprocess.run(
        ['terraform', 'show', '-json'],
        stdout=subprocess.PIPE,
        cwd='./infra',
        check=True
    )
    resources = json.loads(state.stdout.decode('utf8'))['values']['root_module']['child_modules']
    db_host = [x for x in resources if x['address'] == 'module.module_rds'][0]['resources'][0]['values']['address']


    print('2. deploy grateful chat')
    subprocess.run(['npm', 'install'], check=True)
    subprocess.run(['npm', 'run', 'build'], check=True)

    db_user = os.environ.get('DB_USER') or 'db_admin'
    db_name = os.environ.get('DB_NAME') or 'gc_db'
    database_url = 'mysql://{}:{}@{}:3306/{}'.format(db_user, db_passwd, db_host, db_name)

    migrate_cmd = ['./node_modules/.bin/sequelize',
                        'db:migrate',
                        '--env', 'production',
                        '--config', 'server/config/config.json',
                        '--migrations-path', 'server/migrations']
    subprocess.run(migrate_cmd, env={'DATABASE_URL': database_url}, check=True)

    create_user_cmd = ['node', 'server/create_admin_user.js',
                    'admin@example.com', 'password', 'AdminUser']
    subprocess.run(create_user_cmd, check=True)


if __name__ == '__main__':
    main()

import subprocess
import json
import os
import shutil


def main():
    print('1. delete lex resource')
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    lex_bot_name = os.environ.get('LEX_BOT_NAME') or 'GCSupportBot'
    lex_intent_name = os.environ.get('LEX_INTENT_NAME') or 'FirstSupport'

    lex_delete_bot_cmd = ['aws', 'lex-models', 'delete-bot',
                  '--region', region,
                  '--name', lex_bot_name]
    subprocess.run(lex_delete_bot_cmd, check=True)

    lex_put_intent_cmd = ['aws', 'lex-models', 'delete-intent',
                  '--region', region,
                  '--name', lex_intent_name]
    subprocess.run(lex_put_intent_cmd, check=True)

    print('2. Prepare lambda resource')
    subprocess.run(
        ['npm', 'install'],
        stdout=subprocess.PIPE,
        cwd='./lambda',
        check=True
    )
    #subprocess.run(
    #    ['npm', 'run', 'build'],
    #    stdout=subprocess.PIPE,
    #    cwd='./lambda',
    #    check=True
    #)

    lambda_path = './var/lambda_function'
    if not os.path.exists(lambda_path):
        os.mkdir(lambda_path)
        shutil.copyfile('./lambda/index.js', './var/lambda_function/index.js')
        shutil.copytree('./lambda/node_modules', './var/lambda_function/node_modules')

    print('2. destroy infra')
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstate',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_destroy_cmd = ['terraform', 'destroy', '-auto-approve']

    if os.path.exists('terraform.tfvars'):
        terraform_destroy_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_destroy_cmd.append('-var')
        terraform_destroy_cmd.append('aws_db_password=%s' % db_passwd)

    subprocess.run(terraform_destroy_cmd, cwd='./infra', check=True)


if __name__ == '__main__':
    main()

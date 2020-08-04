import subprocess
import json
import os
import shutil
import sys


def main():
    print('1. setup lambda resource')
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
    if os.path.exists(lambda_path):
        shutil.rmtree(lambda_path)

    os.mkdir('./var/lambda_function')
    shutil.copyfile('./lambda/index.js', './var/lambda_function/index.js')
    shutil.copytree('./lambda/node_modules', './var/lambda_function/node_modules')

    print('2. deploy infra')
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstate',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_apply_cmd = ['terraform', 'apply', '-auto-approve']

    if os.path.exists('./infra/terraform.tfvars'):
        terraform_apply_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('aws_db_password=%s' % db_passwd)

    app_session_key = os.environ.get('SESSION_KEY', '')
    if len(app_session_key) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('session_key=%s' % app_session_key)

    app_s3_bucket_name = os.environ.get('AWS_S3_BUCKET_NAME', '')
    if len(app_s3_bucket_name) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('s3_bucket_name=%s' % app_s3_bucket_name)

    subprocess.run(terraform_apply_cmd, cwd='./infra', check=True)
    state = subprocess.run(
        ['terraform', 'show', '-json'],
        stdout=subprocess.PIPE,
        cwd='./infra',
        check=True
    )
    resources = json.loads(state.stdout.decode('utf8'))['values']['root_module']['child_modules']
    if resources:
        db_host = [x for x in resources if x['address'] == 'module.module_rds'][0]['resources'][0]['values']['address']
        print(db_host)

    print('3. deploy lex')
    lambda_func_name = os.environ.get('LAMBDA_FUNC_NAME') or 'answerBySelectedNum'
    lex_bot_name = os.environ.get('LEX_BOT_NAME') or 'GCSupportBot'
    lex_intent_name = os.environ.get('LEX_INTENT_NAME') or 'FirstSupport'
    args = sys.argv
    account_id = args[1]

    source_arn = 'arn:aws:lex:{}:{}:intent:{}:*'.format(
            region, account_id, lex_intent_name)
    lambda_arn = 'arn:aws:lambda:{}:{}:function:{}'.format(
            region, account_id, lambda_func_name)
    intent_json_file = 'var/{}.json'.format(lex_intent_name)

    f = open('infra/data/FirstSupport.json', 'r')
    lex_intent = json.load(f)
    lex_intent['fulfillmentActivity']['codeHook']['uri'] = lambda_arn
    with open(intent_json_file, 'w') as f:
        json.dump(lex_intent, f, indent=4)

    lex_add_permission_cmd = ['aws', 'lambda', 'add-permission',
                              '--region', region,
                              '--function-name', lambda_func_name,
                              '--statement-id', 'Allow%s' % lex_bot_name,
                              '--action', 'lambda:InvokeFunction',
                              '--principal', 'lex.amazonaws.com',
                              '--source-arn', source_arn]
    subprocess.run(lex_add_permission_cmd, check=True)

    lex_put_intent_cmd = ['aws', 'lex-models', 'put-intent',
                  '--region', region,
                  '--name', lex_intent_name,
                  '--cli-input-json', 'file://%s' % intent_json_file]
    subprocess.run(lex_put_intent_cmd, check=True)

    lex_put_bot_cmd = ['aws', 'lex-models', 'put-bot',
                  '--region', region,
                  '--name', lex_bot_name,
                  '--cli-input-json', 'file://infra/data/%s.json' % lex_bot_name]
    subprocess.run(lex_put_bot_cmd, check=True)


if __name__ == '__main__':
    main()

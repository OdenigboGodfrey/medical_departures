FROM public.ecr.aws/lambda/nodejs:18

# Copy your Lambda function code
COPY . /var/task/
RUN npm i

# Set the command to be run when the container starts
CMD [ "src/lambda.lambda_handler" ]
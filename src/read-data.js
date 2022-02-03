const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  // what could you do to improve performance?
  // Use getItem call when applicable, ensure proper key entropy to prevent hotspots.
});

const tableName = "SchoolStudents";
const studentLastNameGsiName = "studentLastNameGsi";

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = async (event) => {
  // In a real Lambda, I would return a 400 error with the message.
  if (!event.schoolId && !event.studentLastName) 
    throw new Error('A school id or student last name must be given.');

  const params = SetQueryParams(event);

  return QueryTable(params);
};

function SetQueryParams(event) {
  let params = {
    TableName: tableName,
    KeyConditionExpression: 'schoolId = :partitionKey',
    ExpressionAttributeValues: {
      ':partitionKey': event.schoolId,
    },
    Limit: 5
  };

  if (event.studentLastName && event.studentLastName.length > 0) {
    params.IndexName = studentLastNameGsiName;
    params.KeyConditionExpression = 'studentLastName = :partitionKey',
    params.ExpressionAttributeValues[':partitionKey'] = event.studentLastName;
  } else if (event.studentId) {
    params.KeyConditionExpression += ' and studentId = :rangeKey';
    params.ExpressionAttributeValues[':rangeKey'] = event.studentId;
  }

  return params;
}

async function QueryTable(params) {
  let students = [];

  do {
    let results = await dynamodb.query(params).promise();
    results.Items.forEach(item => students.push(item));
    params.ExclusiveStartKey = results.LastEvaluatedKey;
  } while (params.ExclusiveStartKey)

  return students;
}
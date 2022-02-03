const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  // what could you do to improve performance?
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
  let params = {
    TableName: tableName,
    Limit: 5
  };

  // TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.
  if (event.studentLastName && event.studentLastName.length > 0) {
    params.IndexName = studentLastNameGsiName;
    params.KeyConditionExpression = 'studentLastName = :partitionKey',
    params.ExpressionAttributeValues = {
      ':partitionKey': event.studentLastName
    };
  // TODO use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  } else {
    params.KeyConditionExpression = 'schoolId = :partitionKey';
    params.ExpressionAttributeValues = {
      ':partitionKey': event.schoolId,
    };

    if (event.studentId) {
      params.KeyConditionExpression += ' and studentId = :rangeKey';
      params.ExpressionAttributeValues[':rangeKey'] = event.studentId;
    }
  }

  return QueryTable(params);
};

async function QueryTable(params) {
  let students = [];

  // TODO (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to return all
  //  pages of records found by the query (uncomment the test which exercises this functionality)
  do {
    let results = await dynamodb.query(params).promise();
    results.Items.forEach(item => students.push(item));
    params.ExclusiveStartKey = results.LastEvaluatedKey;
  } while (params.ExclusiveStartKey)

  return students;
}
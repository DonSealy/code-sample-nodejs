const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
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
exports.handler = (event) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  // TODO use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  var params = {
    RequestItems: {
      tableName: tableName,
      Key: {
        schoolId: event.schoolId,
        studentId: event.studentId,
      },
    },
  };

  try {
    let result = await docClient.get(params).promise();
    return {
      body: JSON.stringify({
        message: "Executed successfully.",
        data: result,
      }),
    };
  } catch (error) {
    console.log(error);
    return error;
  }
  
  // TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.
  // TODO (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to return all
  //  pages of records found by the query (uncomment the test which exercises this functionality)
};

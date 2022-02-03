const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  // what could you do to improve performance?
});

const tableName = "SchoolStudents";

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = (event) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  // TODO validate that all expected attributes are present (assume they are all required)
  if (event.schoolId.length < 1) throw new Error("No school id given.");
  
  if (event.schoolName.length < 1) throw new Error("No school name given.");
  
  if (event.studentId.length < 1) throw new Error("No student id given.");
  
  if (event.studentFirstName.length < 1) throw new Error("No student first name given.");
  
  if (event.studentLastName.length < 1) throw new Error("No student last name given.");
  
  if (event.studentGrade.length < 1) throw new Error("No student grade given.");

  // TODO use the AWS.DynamoDB.DocumentClient to save the 'SchoolStudent' record
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  let params = {
    TableName: tableName,
    Item: {
      schoolId: event.schoolId,
      schoolName: event.schoolName,
      studentId: event.studentId,
      studentFirstName: event.studentFirstName,
      studentLastName: event.studentLastName,
      studentGrade: event.studentGrade,
    },
  };

  try {
    let result = await docClient.put(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Student Id ${event.studentId} successfully recorded.`,
        data: result,
      }),
    };
  } catch (error) {a
    console.log(error);
    return error;
  }
};

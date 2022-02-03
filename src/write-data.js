const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  // what could you do to improve performance?
  // Batch bulk writes.
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
exports.handler = async (event) => {
  // In a real Lambda, I would return a 400 error with the message.
  if (!event.schoolId)
    throw new Error("No school id given.");
  
  if (!event.schoolName)
    throw new Error("No school name given.");
  
  if (!event.studentId)
    throw new Error("No student id given.");
  
  if (!event.studentFirstName)
    throw new Error("No student first name given.");
  
  if (!event.studentLastName)
    throw new Error("No student last name given.");
  
  if (!event.studentGrade)
    throw new Error("No student grade given.");

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

  await dynamodb.put(params).promise();
};

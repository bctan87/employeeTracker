// dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Kirlo!1987",
    database: "employeedb"
});
connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    startApp();
});

const startApp = () => {
    inquirer.prompt([
    {
    type: "list",
    message: "What would you like to do?",
    name: "choice",
    choices: [
                "View All Departments", 
                "View All Roles",
                "View All Employees", 
                "Add Department",
                "Add A Role",
                "Add An Employee",
                "Update An Employee"
            ]
    }
    ]).then(function (res) {
        switch (res.choice) {
            case "View All Employees":
                viewAllEmployees();
            break;

            case "View All Roles":
                viewAllRoles();
            break;

            case "View All Departments":
                viewAllDepartments();
            break;

            case "Add Department":
              addDepartment();
            break;
        
            case "Add A Role":
                addRole();
            break;

            case "Add An Employee":
              addEmployee();
            break;

            case "Update An Employee":
                updateEmployee();
            break;

            }
    })
}

// view departments
const viewAllDepartments = () => {
    connection.query("SELECT * FROM department;", 
    function(err, res) {
      if (err) throw err
      console.table(res)
      startApp()
    })
  }

// view roles
const viewAllRoles = () => {
    connection.query("SELECT * FROM role", 
    function(err, res) {
    if (err) throw err
    console.table(res)
    startApp()
    })
  }

// view all employees
const viewAllEmployees = () => {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(emp.first_name, ' ' ,emp.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee emp ON employee.manager_id = emp.id;", 
    function(err, res) {
      if (err) throw err
      console.table(res)
      startApp()
  })
}

// add a department
const addDepartment = () => {

  inquirer.prompt({

          // Prompt user for name of department
          name: "newDept",
          type: "input",
          message: "Enter Department Name"
      }).then((answer) => {
              
          // add department to the table
          connection.query(`INSERT INTO department (name)VALUES ("${answer.newDept}");`, (err, res) => {
              if(err) return err;
              startApp();
          });

      });
}

// add a role
const addRole = () => { 
    connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role",   function(err, res) {
      inquirer.prompt([
          {
            name: "roleName",
            type: "input",
            message: "Enter Role Name"
          },
          {
            name: "roleSalary",
            type: "input",
            message: "Enter Role Salary"

          }, 
          {
            name: "roleDept",
            type: "list",
            message: "Select Role Department",
            choices: ['Sales', 'Engineering', 'Finance', 'Legal']

          } 
      ]).then(function(res) {
          let selectRoleDept = {};
          selectRoleDept = parseInt(res.roleDept.split('')[0]);
          if (res.roleDept === 'Sales') {
            selectRoleDept = 1;
          } else if (res.roleDept === 'Engineering') {
            selectRoleDept = 2;
          } else if (res.roleDept === 'Finance') {
            selectRoleDept = 3;
          } else if (res.roleDept === 'Legal') {
            selectRoleDept = 4;
          }

          connection.query(
              "INSERT INTO role SET ?",
              {
                title: res.roleName,
                salary: res.roleSalary,
                department_id: selectRoleDept,
              },
              function(err) {
                  if (err) throw err
                  console.table(res);
                  startApp();
              }
          )
      });
    });
  }

// add an employee
var roleArr = [];

const selectRole = () => {
  connection.query("SELECT * FROM role", function(err, res) {
    if (err) throw err
    for (var i = 0; i < res.length; i++) {
      roleArr.push(res[i].title);
    }

  })
  return roleArr;
}

const addEmployee = () => { 
    inquirer.prompt([
        {
          name: "newFirst",
          type: "input",
          message: "Enter their first name"
        },
        {
          name: "newLast",
          type: "input",
          message: "Enter their last name"
        },
        {
          name: "newRole",
          type: "list",
          message: "What is their role?",
          choices: selectRole()
        },
        {
          name: "newManager",
          type: "list",
          message: "Select Manager ID",
          choices: ['Engineering', 'Legal', 'Sales']
        }
    ]).then(function (res) {
      var newRole = selectRole().indexOf(res.newRole) + 1
      let setManager = {};
      setManager = parseInt(res.newManager.split('')[0]);
      if (res.newManager === 'Engineering') {
        setManager = 1;
      } else if (res.newManager === 'Legal') {
        setManager = 2;
      } else if (res.newManager === 'Sales') {
        setManager = 3;
      }
      connection.query("INSERT INTO employee SET ?", 
      {
          first_name: res.newFirst,
          last_name: res.newLast,
          role_id: newRole,
          manager_id: setManager
                    
      }, function(err){
          if (err) throw err
          console.table(res)
          startApp();
      })

  })
}

const updateEmployee = () => {
  let allemp = [];
  connection.query("SELECT * FROM employee", function(err, answer) {

    for (let i = 0; i < answer.length; i++) {
      let employeeList =
        answer[i].id + " " + answer[i].first_name + " " + answer[i].last_name;
      allemp.push(employeeList);
    }

    inquirer
      .prompt([
        {
          type: "list",
          name: "updateEmpRole",
          message: "Select Employee To Update",
          choices: "allemp"
        },
        {
          type: "list",
          message: "Select New Role",
          choices: ['Lead Engineer', 'Legal Team Lead', 'Sales Lead', 'Accountant', 'Salesperson', 'Software Engineer', 'Lawyer'],
          name: "newrole"
        }
      ])
      .then(function(answer) {
        console.log("Update Successful", answer);
        const changeId = {};
        changeId.employeeId = parseInt(answer.updateEmpRole.split(" ")[0]);
        if (answer.newrole === 'Lead Engineer') {
          changeId.role_id = 1;
        } else if (answer.newrole === 'Legal Team Lead') {
          changeId.role_id = 2;
        } else if (answer.newrole === 'Sales Lead') {
          changeId.role_id = 3;
        } else if (answer.newrole === 'Accountant') {
          changeId.role_id = 4;
        } else if (answer.newrole === 'Salesperson') {
          changeId.role_id = 5;
        } else if (answer.newrole === 'Software Engineer') {
          changeId.role_id = 6;
        } else if (answer.newrole === 'Lawyer') {
          changeId.role_id = 7;
        }

        connection.query(
          "UPDATE employee SET role_id = ? WHERE id = ?",
          [changeId.role_id, changeId.employeeId],
          function(err, data) {
            startApp();
          }
        );
      });
  });
}
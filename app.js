// Budget controller
budgetController = (function () {
  var Income = function (id, des, val) {
    this.id = id;
    this.description = des;
    this.value = val;
  };

  var Expenses = function (id, des, val) {
    this.id = id;
    this.description = des;
    this.value = val;
    this.percentage = -1;
  };

  Expenses.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expenses.prototype.getPercentage = function () {
    return this.percentage;
  };

  //   Data structure
  data = {
    allItems: {
      inc: [],
      exp: [],
    },

    total: {
      inc: 0,
      exp: 0,
    },

    budget: 0,

    percentage: -1,
  };

  // calculate percentage for each expense
  var calculatePercentages = function (totalIncome) {
    data.allItems.exp.forEach(function (cur) {
      cur.calcPercentage(totalIncome);
    });
  };

  var calculateTotal = function (type) {
    var value = 0;
    data.allItems[type].map(function (cur) {
        value = value + cur.value})

    data.total[type] = value;
  };

  var calculateBudget = function () {
    var budget, percentage;

    budget = data.total.inc - data.total.exp;
    data.budget = budget;

    if (data.total.inc > 0) {
      percentage = Math.round((data.total.exp / data.total.inc) * 100);
      data.percentage = percentage;
    } else {
      percentage = -1;
    }
  };

  return {
    //   Add input values to data structure
    addInput: function (type, des, val) {
      var newItem, ID;

      //    creating new  id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //   create new item base on inc and exp
      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expenses(ID, des, val);
      }
      // push the new item into th data structure
      data.allItems[type].push(newItem);
      // return newItem
      return newItem;
    },

    // delete input from data structure
    deleteItem: function (type, id) {
      var ids, indexID;
      //   get the id array
      ids = data.allItems[type].map(function (cur) {
        return cur.id;
      });

      //   get index of id from the map array
      indexID = ids.indexOf(id);

      // delete object from data
      if (indexID !== -1) {
        data.allItems[type].splice(indexID, 1);
      }
    },

    calcBudget: function () {
      //    calculate total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");

      //    calculate budget and percentage
      calculateBudget();
    },

    percentages: function () {
      calculatePercentages(data.total.inc);
    },

    getPercentages: function () {
      var allParc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allParc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.total.inc,
        totalExpense: data.total.exp,
        percentage: data.percentage,
      };
    },

    testingData: function () {
      console.log(data);
    },
  };
})();
//
//
//
// UI controller

UIController = (function () {
  DomStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    button: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budget: ".budget__value",
    totalIncome: ".budget__income--value",
    totalExpense: ".budget__expenses--value",
    percentage: ".budget__expenses--percentage",
    container: ".container",
    percentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    /*
    add 2 decimal place
    add comma if its thousand
    */
    //    convert the number to an absolute number
    num = Math.abs(num);
    // add 2 decimal place
    num = num.toFixed(2);
    // split the number
    numSplit = num.split(".");

    int = numSplit[0];
    // 260,000
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    // using the tenery operator
    type === "exp" ? (sign = "-") : (sign = "+");

    return sign + ' ' + int + "." + dec;
  };

  var nodeListItem = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    //   get inpute values
    getInput: function () {
      return {
        type: document.querySelector(DomStrings.inputType).value, // inc or exp
        description: document.querySelector(DomStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DomStrings.inputValue).value),
      };
    },

    // clear input fields
    clearInputFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DomStrings.inputDescription + "," + DomStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (cur) {
        cur.value = "";
      });

      fieldsArr[0].focus();
    },

    // Display input on UI
    addListItem: function (obj, type) {
      var html, newHtml, element;

      if (type === "inc") {
        element = DomStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DomStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // delete list item from UI
    deleteListItem: function (selectID) {
      var el = document.getElementById(selectID);
      el.parentNode.removeChild(el);
    },

    // update budget on UI
    displayBudget: function (obj) {
      if (obj.budget > 0) {
        document.querySelector(DomStrings.budget).textContent = formatNumber(
          obj.budget,
          "inc"
        );
      } else {
        document.querySelector(DomStrings.budget).textContent = formatNumber(
          obj.budget,
          "exp"
        );
      }

      document.querySelector(DomStrings.totalIncome).textContent = formatNumber(
        obj.totalIncome,
        "inc"
      );
      document.querySelector(DomStrings.totalExpense).textContent =
        formatNumber(obj.totalExpense, "exp");

      if (obj.totalIncome > 0) {
        document.querySelector(DomStrings.percentage).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DomStrings.percentage).textContent = "---";
      }
    },

    displayPercentages: function (percentage) {
      fields = document.querySelectorAll(DomStrings.percentageLabel);

      nodeListItem(fields, function (current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayDate: function() {

        now = new Date();

        month = now.getMonth();

        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        year = now.getFullYear()

        date = months[month] + ' ' + year;

        document.querySelector(DomStrings.dateLabel).textContent = date;
    },

    changeType: function () {
      fields = document.querySelectorAll(
        DomStrings.inputType +
          "," +
          DomStrings.inputDescription +
          "," +
          DomStrings.inputValue
      );

      nodeListItem(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DomStrings.button).classList.toggle("red");
    },

    getDomStrings: function () {
      return DomStrings;
    },
  };
})();
//
//
//
// App controller
AppController = (function (budgetCtrl, UICtrl) {
  var setupEventListner = function () {
    // Add event listner for keypress and click
    var DOM = UICtrl.getDomStrings();

    document.querySelector(DOM.button).addEventListener("click", ctrlAddItems);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItems();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  //   update budget function
  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calcBudget();

    // 2. get the budget from budgetController
    var budget = budgetCtrl.getBudget();

    // 3. Update the budget on the UI
    UICtrl.displayBudget(budget);
  };

  //   update percentage function
  var updatePercentage = function () {
    //   calculate percentages
    budgetCtrl.percentages();

    //   get percentages
    var percentages = budgetCtrl.getPercentages();
    console.log(percentages);

    // display percentage on UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItems = function () {
    var input, newItem;
    // 1. Get the input values
    input = UICtrl.getInput();

    // 2. Add the input item to the data structure
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addInput(input.type, input.description, input.value);

      // 3. Add the input item to the user interface
      UICtrl.addListItem(newItem, input.type);

      // 4. clear input fields
      UICtrl.clearInputFields();

      //  5. update budget
      updateBudget();

      //   6. update percentage
      updatePercentage();
    }

    // testing data output
    budgetCtrl.testingData();
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    // get id from the target event
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // split itemID
      splitID = itemID.split("-");

      // get the type and id from the splitID array
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Re-calculate budget
      updateBudget();

      //   update percentages
      updatePercentage();
    }
  };

  return {
    init: function () {
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: 0,
      });
      setupEventListner();
      UICtrl.displayDate()
    },
  };
})(budgetController, UIController);

AppController.init();

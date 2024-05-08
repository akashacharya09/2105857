const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = 3000;
const windowSize = 10;
let numbers = [];
const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTUxOTg0LCJpYXQiOjE3MTUxNTE2ODQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkwOTdmMzg2LTdmMjMtNDg0YS04NDY1LTliZjgwMWM4NjEwNiIsInN1YiI6IjIxQGtpaXQuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjkwOTdmMzg2LTdmMjMtNDg0YS04NDY1LTliZjgwMWM4NjEwNiIsImNsaWVudFNlY3JldCI6IkRqaXBaU25oQWNJbHFZTG0iLCJvd25lck5hbWUiOiJNYXlhbmsiLCJvd25lckVtYWlsIjoiMjFAa2lpdC5hYy5pbiIsInJvbGxObyI6IjIxMDU5MDAifQ.lfyi8AJr8iMoEv0hZW-KQg5ij7hV2M67GISQzALVnvM'

const fetchNumbers = async (url) => {
  try {
    const apiResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return apiResponse.data.numbers; // Extract 'numbers' from the response
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return [];
  }
};

const calculateAverage = (nums) => {
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return sum / nums.length;
};

const updateNumbers = (newNumber) => {
  if (numbers.length >= windowSize) {
    numbers.shift(); // Remove the oldest number
  }
  numbers.push(newNumber); // Add the newest number
};

app.get("/numbers/:numberid", async (request, response) => {
  const { numberid } = request.params;
  let url;

  switch (numberid) {
    case 'p':
      url = "http://20.244.56.144/test/primes";
      break;
    case 'f':
      url = "http://20.244.56.144/test/fibo";
      break;
    case 'e':
      url = "http://20.244.56.144/test/even";
      break;
    case 'r':
      url = "http://20.244.56.144/test/rand";
      break;
    default:
      return response.status(400).send("Invalid number ID");
  }

  const start = Date.now();
  const fetchedNumbers = await fetchNumbers(url);
  const elapsedTime = Date.now() - start;

  if (elapsedTime > 500) {
    return response.status(500).send("Timeout error");
  }

  const prevNumbers = [...numbers];
  if (Array.isArray(fetchedNumbers)) {
    fetchedNumbers.forEach((num) => {
      if (!numbers.includes(num)) {
        updateNumbers(num);
      }
    });
  }

  const average = calculateAverage(numbers);

  const responseData = {
    windowPrevState: prevNumbers,
    windowCurrState: numbers,
    numbers: fetchedNumbers,
    avg: average.toFixed(2)
  };

  response.json(responseData);
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
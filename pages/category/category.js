const API_KEY = "ttblsy0006261819001"; 

let totalResults = 0;
let page = 1;
const maxResults = 20; 
const groupSize = 5;


const getCategoryBooks=async()=>{
    const url = new URL(`http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${API_KEY}&QueryType=ItemNewAll&MaxResults=10&start=1&SearchTarget=Book&output=JS&Version=20131101`);
    const response =await fetch(url);
    console.log("rrr",response);
}

getCategoryBooks()
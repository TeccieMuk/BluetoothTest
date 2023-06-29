import { setEnvironment } from "./api_service.js" 

const environments = [
    {
        "name": "Development",
        "postfix": "dev",
        "base_url" : 'https://22ajohpbrd.execute-api.eu-west-1.amazonaws.com/dev',
        "auth_header" : 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImlzcyI6InRqZWNjby5jb20iLCJhdWQiOiJzZW5zb3JpbmciLCJpYXQiOjE2ODM1NDkyNzEsImV4cCI6MTcxNTQxOTgzMiwianRpIjozNzMsImtpZCI6NjIsImFpZCI6Mywic2NvcGUiOlt7InJpZCI6IlNTT0NPTUEiLCJvcmciOiJUZXN0QWNjb3VudCJ9XX0.RgDztCPTOFFcO3yzcwapchx5oSNQx9opb6AmkHFJ7Z2y2VOCXco5iGC3aJRg6-zYAHuoczsWo7-7DdtS_r3svBdFvtPEkGbSg6J6hjCQWE2ktndjhaxjVO2aG5rb6WH5u1m-jMuocq7d26ZLJpWreuYW2EhZjFDhyQvhnmyqYoK2eQP0CLlKIlEwlHdQWym8CSiJ2NpHu8Qgj1umvbtED_Kw9vgrxDcrU9vMeMU5DMha7DF2M_LLD8LyQKNK-2OmWr07yxWv-JmskVRkYo2zN0QfHvEZpA2LbAHeb73GyTcMT4-nK5MuW-rBS69Mmgr7AtzMWpb0xsgmH8JBEnc21A'
    },
    {
        "name": "Staging",
        "postfix": "staging",
        "base_url": "https://ty7p9ko8hd.execute-api.eu-west-1.amazonaws.com/staging",
        "auth_header": "Bearer eyJhbGciOiJSUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImlzcyI6InRqZWNjby5jb20iLCJhdWQiOiJzZW5zb3JpbmciLCJpYXQiOjE2ODM1NDkyNzEsImV4cCI6MTcxNTQxOTgzMiwianRpIjozNzMsImtpZCI6NjIsImFpZCI6Mywic2NvcGUiOlt7InJpZCI6IlNTWVJPT1QiLCJvcmciOiJUb3BpYyJ9XX0.RJNBGtZMQbPmsZJGB_YRbjA8jvUi58O2utPi43LMyT6iwuZIlnVGoaYHFU6fL6ZRwyMzwV3_sik8QD3T58RuY7UqIzBWcMMRXsFZ3V8wTaiHvE5O1iUzxGtxYnrBhK_yhVctVc734IXmLFarbfAas37_tM-zNlnDHtBBxsVqnrC7vbDIcRsd6SF1xqwVRO1K6jqm0ST8Y-fXWLRYgbC7ZndMUZlQFyxaIXi5sITu1annxfT2abBwj4XXuqqTH797bIRjnZ21Lw4EafR1xiTcaFKIknwA8-dmzb9JRrpt1uzRRCAyhmi_C3uJNVjxeWRpCwz5V3WEaunmFfcOYNZFXg"
    }
]

export function getEnvironments(){
    return environments
}

export async function initializeEnvironments(dropdownContainer, dropdownButton)
{
  const environments = getEnvironments()
  for (let i = 0; i < environments.length; ++i)
  {
    const environment = environments[i]
    const button = document.createElement("button")
    button.setAttribute("class", "dropdown-item")
    button.setAttribute("type", "button")
    button.textContent = environment.name
    button.onclick = function() { selectEnvironment(i, dropdownButton); }
    dropdownContainer.appendChild(button)
  }
  selectEnvironment(0, dropdownButton)
}

async function selectEnvironment(environmentIndex, dropdownButton)
{
  const environment = getEnvironments()[environmentIndex]
  console.log(dropdownButton)
  dropdownButton.textContent = `Environment: ${environment.name}`
  setEnvironment(environment)
}
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
        "auth_header": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ0amVjY28uY29tIiwiYXVkIjoic2Vuc29yaW5nIiwiaWF0IjoxNjg4MDI5OTg2LCJleHAiOjE2ODgwMzA4ODYsImp0aSI6MTc3LCJraWQiOjI3LCJhaWQiOjExLCJzY29wZSI6W3sicmlkIjoiU1NZUk9PVCIsIm9yZyI6NX1dfQ.cxGwChdzTnqnkCx-YHzx98SmNiEyx-XGCQIb5qZiPH2YOks9bGZVynWmKh2unpFlcJiCcANTiBJAeJwUkaidZzRPdUGjGqD_u-EijWe2SnO1SDsoa65ChRnDdWKdQH2h-pPpWjza6mhXoafelvdVktDAVarruP4rY93QHCMrtZvtfhf_Am-t4cTv19UsJ_MPJpt94hGIl_P86JyUOBQFobLSrbgMHEzheULMb1F_CqB6Pt9UcL9oS7b1lVpL4soqavtkJwC32fAagH3oFlZrnMsv3NkkzIXAE7EWWj8HiNJTsGbOf2bjcsmZQ_Lwg_XdbACreAN0Zvsidka5etaBMQ"
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
create user => /register - POST : ({name:""}) -> ({id:"",token:""})
get rooms => /rooms - GET : (\[{id:"",name:"",users:\[{name:""}\]}\])
create room => /createRoom - POST {name:""} => {id:""}

//open up the default tab
document.getElementById("mainTabDefault").onclick();

//add the event listener for new project
document.getElementById("newProjectForm").addEventListener("submit", addNewProject, false);

projectArray = [];

var invalidClassSelectors = "~ ! @ $ % ^ & * ( ) + = , . / ' \" ; : ? > < [ ] \\ { } | ` #".split(" ");

//load up the projects, if used before
if(localStorage.getItem("newContent") !== undefined) loadProjects();

//set autosaving function
window.setInterval(function(){
    saveProjects(true);
}, 5000);

//helper functions
function getProjectClassName(projectName){
    return "Project" + projectName.replace(/\s/g, '');
}

function fromTemplate(templateName){
    var itemTemplate = document.getElementById(templateName + "TemplateWrapper").content;
    var item = itemTemplate.getElementById(templateName + "Template").cloneNode(true);
    item.removeAttribute("id");
    
    return item;
}

function stringContains(string, charArray){
    for(var i = 0, n = charArray.length; i<n; i++){
        if(string.includes(charArray[i])){
            return true;
        }
    }
    return false;
}


//Content appending functions
function addProjectSelector(projectName){
    //create component elements
    var projectSelector = fromTemplate("projectSelector");
    var name = document.createTextNode(projectName);
    
    //obtain class name for project identification, and references to elements
    var className = getProjectClassName(projectName);
    var nameComponent = projectSelector.getElementsByClassName("name")[0];
    var closeComponent = projectSelector.getElementsByClassName("close")[0];
    
    //build the selector
    projectSelector.classList.add(className);
    nameComponent.appendChild(name);
    
    //add event listener to delete project, and open the project
    closeComponent.addEventListener("click", function(){deleteProject(projectName)}, false);
    projectSelector.addEventListener("click", function(){openProject(projectName)}, false);
    
    return projectSelector;
}

function addProjectContent(projectName, dueDate, description){
    //create content from appropriate template
    var projectContent = fromTemplate("projectContent");
    
    //obtain class name for project identification
    var className = getProjectClassName(projectName);
    
    //modify attributes of content container
    projectContent.classList.add(className);
    projectContent.getElementsByClassName("projectHeader")[0].setAttribute("value", projectName);
    
    if(dueDate) projectContent.getElementsByClassName("projectDueDate")[0].setAttribute("value", dueDate);
    if(description) projectContent.getElementsByClassName("projectDescription")[0].value = description;
    
    //add event listener to add phases within content container
    projectContent.getElementsByClassName("newPhaseContainer")[0].addEventListener("click", function(){addPhase(projectName)}, false);
    //add blur event listener for due date input
    //add blur event listener for description input
    
    return projectContent;
}

function addProject(projectName, dueDate, description) {
    //obtain references to necessary page elements
    var projectList = document.getElementById("projectList");
    var projectContainer = document.getElementById("projects");
    
    //append the project selector to the document, above the new project input field
    var projectSelector = addProjectSelector(projectName);
    projectList.insertBefore(projectSelector, document.getElementById("newProject"));
    
    //append the project content division to the page
    var projectContent = addProjectContent(projectName, dueDate, description);
    projectContainer.appendChild(projectContent);
    
    //add due date and description to phase object
    projectArray.push(new Project(projectName, dueDate, description));
    
}

function addPhase(projectName, phaseName){
    //create content from appropriate template
    var phaseContainer = fromTemplate("phaseContainer");
    
    //obtain reference to project content container elements
    var className = getProjectClassName(projectName);
    var projectContent = document.querySelector("div." + className);
    var newPhaseContainer = document.querySelector("." + className +" .newPhaseContainer");
    
    //set the phase number attribute of the new phase container
    var phaseNumber = 0;
    var phases = projectContent.getElementsByClassName("phaseContainer");
    
    if(phases.length > 1){
        phaseNumber = parseInt(phases[phases.length-2].getAttribute("phaseNumber")) + 1;
    }
    
    //set attributes of the phase container
    phaseContainer.classList.add("Phase" + phaseNumber);
    phaseContainer.setAttribute("phaseNumber", phaseNumber);
    
    if(!phaseName){
        phaseName = "Phase " + phaseNumber;
    }
        
    phaseContainer.getElementsByClassName("phaseHeader")[0].setAttribute("value", phaseName);
    
    //add event listeners to modify the elements of the phase container
    phaseContainer.getElementsByClassName("close")[0].addEventListener("click", function(){deletePhase(phaseContainer)});
    phaseContainer.getElementsByClassName("phaseHeader")[0].addEventListener("blur", function(){this.setAttribute("value", this.value)}, false);
    phaseContainer.getElementsByClassName("newTaskForm")[0].addEventListener("submit", addNewTask, false);
    
    //append a new phase to the appropriate project object
    var projectObject = projectWithName(projectName);
    var phaseObject = new Phase(phaseName, phaseNumber);
    projectObject.phases[phaseNumber] = phaseObject;
    phaseContainer.phaseObject = phaseObject;
    console.log(phaseContainer.phaseObject);
    
    //append the phase container to the project content container
    projectContent.insertBefore(phaseContainer, newPhaseContainer);
    
    function addNewTask(){
        window.event.preventDefault();
        
        var newTaskInput = phaseContainer.getElementsByClassName("newTaskInput")[0];
        
        //obtain task name
        var taskName = newTaskInput.value;
        
        //error checking: make sure project name is valid
        if(taskName === "" || !/\S/.test(taskName)){
            return;
        }
        
        //clean up interface
        newTaskInput.value = "";
        
        addTask(projectName, phaseContainer.getAttribute("phaseNumber"), taskName);
    }
}

function addTask(projectName, phaseNumber, taskName, checked, marked){
    //obtain references to all elements of application page
    var projectContent = document.querySelector("div." + getProjectClassName(projectName));
    var phaseContainer = projectContent.getElementsByClassName("Phase" + phaseNumber)[0];
    var taskList = phaseContainer.getElementsByClassName("taskList")[0];
    var newTask = taskList.getElementsByClassName("newTaskLI")[0];
    
    //create elements for task
    var task = fromTemplate("task");
    var nameComponent = task.getElementsByClassName("name")[0];
    var name = document.createTextNode(taskName);
    
    //build the task
    nameComponent.appendChild(name);
    
    //modify elements of task
    if(checked) task.classList.add("checked");
    if(marked) task.classList.add("marked");
    
    //add event listeners
    task.addEventListener("click", function(){toggleCheck(task)}, false)
    task.getElementsByClassName("closeTask")[0].addEventListener("click", function(){deleteTask(task)}, false);
    task.getElementsByClassName("markTask")[0].addEventListener("click", function(){toggleMarked(task)}, false);
    
    //append a task object to the correct object
    var projectObject = projectWithName(projectName);
    var phaseObject = projectObject.phases[phaseNumber]
    var taskObject = new Task(taskName, checked, marked);
    phaseObject.tasks.push(taskObject);
    
    //append the task object to the task DOM element
    task.taskObject = taskObject;
    
    //append the task to the appropriate place
    taskList.insertBefore(task, newTask);
    
    //helper functions
    function toggleCheck(task){
        if(!window.event.target.classList.contains("markTask")){
            task.classList.toggle('checked');
            task.taskObject.checked = !task.taskObject.checked
        }
    }
    
    function toggleMarked(task){
        task.classList.toggle("marked");
        task.taskObject.marked = !task.taskObject.marked;
    }
    
    function deleteTask(task){
        task.parentElement.removeChild(task);
        var index = phaseObject.tasks.indexOf(taskObject);
        phaseObject.tasks.splice(index, 1);
    }
}

function addNewProject(){
    window.event.preventDefault();
    var newProjectInput = document.getElementById("newProjectInput");
    
    //obtain project name
    var projectName = newProjectInput.value;
    
    //clean up interface
    newProjectInput.value = "";
    
    //error checking: make sure project name is valid
    if(projectName === ""){
        return;
    }
    
    if(stringContains(projectName, invalidClassSelectors)){
        alert("Invalid Name. Special characters are not allowed");
        return;
    }
    
    if(projectWithName(projectName.trim()) !== -1){
        alert("A project with that name alread exists");
        return;
    }
    
    addProject(projectName);
    openProject(projectName);
}

//Content removal functions
function deleteProject(projectName) {
    if (confirm("Are you sure you want to delete " + projectName + "?")) {
        var projectElement = document.getElementsByClassName(getProjectClassName(projectName))[0];
        projectElement.parentElement.removeChild(projectElement);
        
        var projectObject = projectWithName(projectName);
        var index = projectArray.indexOf(projectObject);
        projectArray.splice(index, 1);
    }
}

function deletePhase(phase){
    var phaseName = phase.getElementsByClassName("phaseHeader")[0].value;
    console.log(phase.phaseObject);
    if(confirm("Are you sure you want to delete " + phaseName +  "?")){
        
        delete phase.phaseObject;
        phase.parentElement.removeChild(phase);
    }
}

function deletePhaseTest(projectName, phaseNumber){
    var projectElement = document.querySelector("div." + getProjectClassName(projectName))[0];
    var phaseElement = projectElement.getElementsByClassName("Phase" + phaseNumber)[0];
    phaseElement.parentElement.removeChild(phaseElement);
    
    var projectObject = projectWithName(projectName);
    var index = projectArray.indexOf(projectObject);
    projectArray[index] = undefined;
}

//Content viewing functions
function hideMainTabs() {
    var tabContent = document.getElementsByClassName("mainTabContent");
    var tabButtons = document.querySelectorAll(".buttonGroup button");
    for (var i = 0, n = tabContent.length; i < n; i++) {
        tabContent[i].style.display = "none";
        tabButtons[i].classList.remove("active");
    }
}

function openMainTab(button, tabId) {
    hideMainTabs();
    document.getElementById(tabId).style.display = "block";
    button.classList.add("active");
}

function hideProjects() {
    var projectContent = document.getElementsByClassName("projectContent");
    var projectButtons = document.querySelectorAll("#projectList li");
    for(var i = 0, n=projectContent.length; i<n; i++){
        projectContent[i].style.display = "none";
        projectButtons[i].classList.remove("active");
    }
}

function openProject(projectName) {
    var event = window.event;
    
    //obtain project class name for identificaiton
    var className = getProjectClassName(projectName);
    
    //prevent a click on the close button from triggering this action
    if(typeof event !== "undefined" && event.target.className == "close"){
        return;
    }
    
    hideProjects();
    
    //modify appropriate atributes
    document.querySelector("div." + className).style.display = "block";
    document.querySelector("li."+className).classList.add("active");
    console.log(document.querySelector("div." + className));
}

//content storage objects
function Project(name, dueDate, description){
    this.name = name;
    this.dueDate = dueDate;
    this.description = description;
    this.phases = [];
}

function Phase(name, number){
    this.name = name;
    this.number = number;
    this.tasks = [];
}

function Task(name, checked, marked){
    this.name = name;
    this.checked = checked;
    this.marked = marked;
}

//returns the reference to the project object
function projectWithName(projectName){
    for(var i = 0, n = projectArray.length; i<n; i++){
        if(projectArray[i].name === projectName){
            return projectArray[i];
        }
    }
    return -1;
}

//Not yet implemented
function changeName(className, newName){
    document.querySelector("div." + className + " input").value = newName;
    document.querySelector("li."+className).childNodes[0].data = newName;
}

function saveProjects(autosaved){
    var cache = JSON.stringify(projectArray);
    localStorage.setItem("newContent", cache);
    if(autosaved) console.log("Projects Autosaved");
}

function loadProjects(){
    var cache = JSON.parse(localStorage.getItem("newContent"));
    var project;
    var phase;
    var task;
    
    for(var i = 0, n = cache.length; i<n; i++){
        project = cache[i];
        addProject(project.name, project.dueDate, project.description);
        for(var j = 0, m=project.phases.length; j<m; j++){
            phase = project.phases[j];
            addPhase(project.name, phase.name);
            for(var k = 0; k<phase.tasks.length; k++){
                task = phase.tasks[k]
                addTask(project.name, phase.number, task.name, task.checked, task.marked);
            }
        }
    }
    
    document.getElementById("mainTabDefault").onclick();
    if(projectArray.length > 0) openProject(projectArray[0].name);

    
}
//open up the default tab
    document.getElementById("mainTabDefault").onclick();

function redoListeners(){
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
        
        addProject(projectName);
        openProject(projectName);
    }
    
    //add the event listener for new project
    document.getElementById("newProjectForm").addEventListener("submit", addNewProject, false);
}

redoListeners();

var invalidClassSelectors = "~ ! @ $ % ^ & * ( ) + = , . / ' \" ; : ? > < [ ] \\ { } | ` #".split(" ");

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

function addProjectContent(projectName){
    //create content from appropriate template
    var projectContent = fromTemplate("projectContent");
    
    //obtain class name for project identification
    var className = getProjectClassName(projectName);
    
    //modify attributes of content container
    projectContent.classList.add(className);
    projectContent.getElementsByClassName("projectHeader")[0].setAttribute("value", projectName);
    
    //add event listener to add phases within content container
    projectContent.getElementsByClassName("newPhaseContainer")[0].addEventListener("click", function(){addPhase(projectName)}, false);
    
    return projectContent;
}

function addProject(projectName) {
    //obtain references to necessary page elements
    var projectList = document.getElementById("projectList");
    var projectContainer = document.getElementById("projects");
    
    //append the project selector to the document, above the new project input field
    var projectSelector = addProjectSelector(projectName);
    projectList.insertBefore(projectSelector, document.getElementById("newProject"));
    
    //append the project content division to the page
    var projectContent = addProjectContent(projectName);
    projectContainer.appendChild(projectContent);
}

function addPhase(projectName){
    //create content from appropriate template
    var phaseContainer = fromTemplate("phaseContainer");
    
    //obtain reference to project content container elements
    var className = getProjectClassName(projectName);
    var projectContent = document.querySelector("div." + className);
    var newPhaseContainer = document.querySelector("." + className +" .newPhaseContainer");
    
    //set the phase number attribute of the new phase container
    var phaseNumber = 1;
    var phases = projectContent.getElementsByClassName("phaseContainer");
    
    if(phases.length > 1){
        phaseNumber = parseInt(phases[phases.length-2].getAttribute("phaseNumber")) + 1;
    }
    
    //set attributes of the phase container
    //phaseContainer.classList.add(className + "Phase" + phaseNumber); <--- Can this be deleted?
    phaseContainer.classList.add("Phase" + phaseNumber);
    
    phaseContainer.setAttribute("phaseNumber", phaseNumber);
    phaseContainer.getElementsByClassName("phaseHeader")[0].setAttribute("value", "Phase " + phaseNumber);
    
    //add event listeners to modify the elements of the phase container
    phaseContainer.getElementsByClassName("close")[0].addEventListener("click", function(){deletePhase(phaseContainer)});
    phaseContainer.getElementsByClassName("phaseHeader")[0].addEventListener("blur", function(){this.setAttribute("value", this.value)}, false);
    phaseContainer.getElementsByClassName("newTaskForm")[0].addEventListener("submit", addNewTask, false);
    
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
    
    //append the phase container to the project content container
    projectContent.insertBefore(phaseContainer, newPhaseContainer);
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
    task.addEventListener("click", function(){if(!window.event.target.classList.contains("markTask")) task.classList.toggle('checked')}, false);
    task.getElementsByClassName("closeTask")[0].addEventListener("click", function(){task.parentElement.removeChild(task)}, false);
    task.getElementsByClassName("markTask")[0].addEventListener("click", function(){task.classList.toggle("marked")}, false);
    
    //append the task to the appropriate place
    taskList.insertBefore(task, newTask);
}


//Content removal functions
function deleteProject(projectName) {
    if (confirm("Are you sure you want to delete " + projectName + "?")) {
        var projectElements = document.getElementsByClassName(getProjectClassName(projectName));
        for(var i = 0, n = projectElements.length; i<n; i++){
            projectElements[0].parentElement.removeChild(projectElements[0]);
        }
        
    }
}

function deletePhase(phase){
    var phaseName = phase.getElementsByClassName("phaseHeader")[0].value;
    if(confirm("Are you sure you want to delete " + phaseName +  "?")){
        phase.parentElement.removeChild(phase);
    }
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

//Not yet implemented
function changeName(className, newName){
    document.querySelector("div." + className + " input").value = newName;
    document.querySelector("li."+className).childNodes[0].data = newName;
}

//TODO:Modify to use Project, Phase and Task Objects
function saveProjects(){
    var cache = document.getElementById("projects").outerHTML;
    localStorage.setItem("content", cache);
}

function loadProjects(){
    document.getElementById("projects").outerHTML = localStorage.getItem("content");
    redoListeners();
    
    redoProjectSelectorListeners();
    redoProjectContentListeners();
    redoPhaseContainerListeners();
    redoTaskListeners();
}


//TODO: Deprecate and delete
function redoProjectSelectorListeners(){
    var projectSelectors = document.querySelectorAll("#projectMenu li");

    for(var i = 0, n = projectSelectors.length - 1; i<n; i++){
        projectSelectors[i].addEventListener("click", function(){openProject(this.firstChild.data, window.event)}, false);
        projectSelectors[i].getElementsByClassName("close")[0].addEventListener("click", function(){deleteProject(this.parentElement.firstChild.data)}, false);
    }
}

function redoProjectContentListeners(){
    var projectContent = document.getElementsByClassName("projectContent");
    
    for(var i = 0, n = projectContent.length; i<n; i++){
        projectContent[i].getElementsByClassName("newPhaseContainer")[0].addEventListener("click",
        function(){
            var className = "Project" + this.parentElement.getElementsByClassName("projectHeader")[0].value.replace(/\s/g, '');
            addPhase(className);
        }, false);
    }
}

function redoPhaseContainerListeners(){
    var phaseContainers = document.querySelectorAll(".phaseContainer:not(.newPhaseContainer)");
    
    for(var i = 0, n = phaseContainers.length; i<n; i++){
        phaseContainers[i].getElementsByClassName("close")[0].addEventListener("click", function(){deletePhase(this.parentElement)}, false);
        phaseContainers[i].getElementsByClassName("newTaskForm")[0].addEventListener("submit", function(){addTask(window.event, this.parentElement.parentElement.parentElement)}, false)
        phaseContainers[i].getElementsByClassName("phaseHeader")[0].addEventListener("blur", function(){this.setAttribute("value", this.value)}, false);
    }
}

function redoTaskListeners(){
    var tasks = document.getElementsByClassName("task");
    console.log(tasks);
    
    for(var i = 0, n = tasks.length; i<n; i++){
        tasks[i].addEventListener("click", function(){toggleCheck(window.event, this)}, false);
        tasks[i].getElementsByClassName("closeTask")[0].addEventListener("click", function(){deleteTask(this.parentElement.parentElement)}, false);
        tasks[i].getElementsByClassName("markTask")[0].addEventListener("click", function(){toggleMarked(this.parentElement.parentElement)}, false);
    }
}

hideProjects();

function redoListeners(){
    //open up the default tab
    document.getElementById("mainTabDefault").onclick();
    
    //add the event listener for new project
    document.getElementById("newProjectInput").addEventListener("blur", function(){addProject(window.event, document.getElementById("newProjectInput").value)}, false);

    document.getElementById("newProjectForm").addEventListener("submit", function(){addProject(window.event, document.getElementById("newProjectInput").value)}, false);
}

redoListeners();

var invalidClassSelectors = "~ ! @ $ % ^ & * ( ) + = , . / ' \" ; : ? > < [ ] \\ { } | ` #".split(" ");

var test;

function toggleCheck(event, task){
    if(event.target.tagName == "LI"){
        task.classList.toggle('checked');
    }
}

function toggleMarked(task){
    task.classList.toggle('marked');
}

function fromTemplate(templateName){
    var itemTemplate = document.getElementById(templateName + "TemplateWrapper").content;
    var item = itemTemplate.getElementById(templateName + "Template").cloneNode(true);
    item.removeAttribute("id");
    
    return item;
}

function deleteProject(projectName) {
    if (confirm("Are you sure you want to delete " + projectName + "? This change cannot be reversed")) {
        var projectElements = document.getElementsByClassName("Project" + projectName.replace(/\s/g, ''));
        for(var i = 0, n = projectElements.length; i<n; i++){
            projectElements[0].parentElement.removeChild(projectElements[0]);
        }
        
    }
}

function deletePhase(phase){
    var phaseName = phase.childNodes[3].value;
    if(confirm("Are you sure you want to delete " + phaseName +  "?")){
        //phase = document.getElementsByClassName(className)[0];
        test = phase;
        phase.parentElement.removeChild(phase);
    }
    
}

function deleteTask(task){
    task.parentElement.removeChild(task);
}

function addProjectSelector(projectName){
    var projectSelector = fromTemplate("projectSelector");
    
    projectSelector.classList.add("Project" + projectName.replace(/\s/g, ''));
    projectSelector.firstChild.data = projectName;
    
    projectSelector.getElementsByClassName("close")[0].addEventListener("click", function(){deleteProject(projectName)}, false);
    projectSelector.addEventListener("click", function(){openProject(projectName, window.event)}, false);
    
    return projectSelector;
}

function addProjectContent(projectName){
    var projectContent = fromTemplate("projectContent");
    var className = "Project" + projectName.replace(/\s/g, '');
    
    projectContent.classList.add("Project" + projectName.replace(/\s/g, ''));
    projectContent.getElementsByClassName("projectHeader")[0].setAttribute("value", projectName);
    
    projectContent.getElementsByClassName("newPhaseContainer")[0].addEventListener("click", function(){addPhase(className)}, false);
    
    return projectContent;
}

function addProject(event, projectName, manual) {
    if(!manual){
        event.preventDefault();
    }

    //obtain the name input by the user, and references to parts of webpage
    //var projectName = document.getElementById("newProjectInput").value;
    var projectList = document.getElementById("projectList");
    
    //error checking: make sure project name is valid
    if(projectName === ""){
        return;
    }
    
    if(stringContains(projectName, invalidClassSelectors)){
        alert("Invalid Name. Special characters are not allowed");
        document.getElementById("newProjectInput").value = "";
        return;
    }
    
    //reset the input field for making new project
    document.getElementById("newProjectInput").value = "";
    
    //append the project selector to the document, above the new project input field
    var li = addProjectSelector(projectName);
    projectList.insertBefore(li, document.getElementById("newProject"));
    
    //append the project content division to the page
    var projectContent = addProjectContent(projectName);
    document.getElementById("projects").appendChild(projectContent);
    
    //make that project the focus of the webpage
    openProject(projectName, event);
    
}

function addPhase(className){
    var phaseContainer = fromTemplate("phaseContainer");
    var projectContent = document.querySelector("div." + className);
    var newPhaseContainer = document.querySelector("." + className +" .newPhaseContainer");
    
    //get the current phase number for this phaseContainer
    var phaseNumber = 0;
    var phases = document.querySelectorAll("div." + className + " .phaseContainer");
    
    if(phases.length !== 1){
        phaseNumber = parseInt(phases[phases.length-2].getAttribute("phaseNumber")) + 1;
    }
    
    if(isNaN(phaseNumber)){
        phaseNumber = 0;
        console.error("Please don't include phases!");
    }
    
    phaseContainer.classList.add(className + "Phase" + phaseNumber);
    
    phaseContainer.setAttribute("phaseNumber", phaseNumber);
    
    phaseContainer.getElementsByClassName("phaseHeader")[0].setAttribute("value", "Phase " + phaseNumber);
    
    
    phaseContainer.getElementsByClassName("close")[0].addEventListener("click", function(){deletePhase(phaseContainer)});
    phaseContainer.getElementsByClassName("newTaskForm")[0].addEventListener("submit", function(){addTask(window.event, phaseContainer)}, false);
    phaseContainer.getElementsByClassName("phaseHeader")[0].addEventListener("blur", function(){this.setAttribute("value", this.value)}, false);
    
    projectContent.insertBefore(phaseContainer, newPhaseContainer);
}

function addTask(event, phaseContainer){
    event.preventDefault();
    var taskName = event.currentTarget.childNodes[1].value;
    var taskList = phaseContainer.childNodes[5];
    var newTask = event.currentTarget.parentElement;
    
    if(taskName === "" || !/\S/.test(taskName)){
        return;
    }

    var task = fromTemplate("task");
    task.firstChild.data = taskName;
    
    event.currentTarget.childNodes[1].value = "";
    
    task.addEventListener("click", function(){toggleCheck(window.event, task)}, false);
    task.getElementsByClassName("closeTask")[0].addEventListener("click", function(){deleteTask(task)}, false);
    task.getElementsByClassName("markTask")[0].addEventListener("click", function(){toggleMarked(task)}, false);
    
    taskList.insertBefore(task, newTask);

}

function addTaskManual(taskName, checked, marked, phaseContainerClassName){
    var task = fromTemplate("task");
    var taskList = document.getElementsByClassName(phaseContainerClassName)[0].childNodes[5];
    
    task.firstChild.data = taskName;
    
    if(checked){
        task.classList.add("checked");
    }
    
    if(marked){
        task.classList.add("marked");
    }
    
    task.addEventListener("click", function(){toggleCheck(window.event, task)}, false);
    
    task.getElementsByClassName("closeTask")[0].addEventListener("click", function(){deleteTask(task)}, false);
    
    task.getElementsByClassName("markTask")[0].addEventListener("click", function(){toggleMarked(task)}, false);
    
    taskList.insertBefore(task, taskList.childNodes[taskList.childNodes.length - 2]);
    
 }
 
//Hide all elements in the tab class, closes buttons
function hideMainTabs() {
    var tabContent = document.getElementsByClassName("mainTabContent");
    var tabButtons = document.querySelectorAll(".buttonGroup button");
    for (var i = 0, n = tabContent.length; i < n; i++) {
        tabContent[i].style.display = "none";
        tabButtons[i].classList.remove("active");
    }
}

//opens a given main tab
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

function openProject(projectName, event) {
    console.log(event);
    if(event.target.tagName !== "LI" && event.type !== "submit"){
        return;
    }
    var className = "Project" + projectName.replace(/\s/g, '');
    hideProjects();
    document.querySelector("div." + className).style.display = "block";
    document.querySelector("li."+className).classList.add("active");
}

function changeName(className, newName){
    document.querySelector("div." + className + " input").value = newName;
    document.querySelector("li."+className).childNodes[0].data = newName;
}

function stringContains(string, charArray){
    for(var i = 0, n = charArray.length; i<n; i++){
        if(string.includes(charArray[i])){
            return true;
        }
    }
    return false;
}

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
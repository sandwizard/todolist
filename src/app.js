

App ={
    contracts: {},
    loading: false,
    load:async () =>{
        await App.loadWeb3();    
        await App.loadAccount();
        await App.loadContract();
        await App.render();
        
    },
    loadWeb3: async () => {

      window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
      }
      if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
          // Request account access if needed
          await ethereum.enable();
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */});
      } catch (error) {
          // User denied account access...
      }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
      }
      // Non-dapp browsers...
      else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
      });
    },
    
    loadAccount: async () =>{
      try{
        const account = await ethereum.request({ method: 'eth_requestAccounts' });
        App.account = account[0];
        console.log(App.account)

      }
      catch(err){
        App.setLoading(true);
        console.log('user connection declined');
      }                                     
    },
    loadContract: async () =>{
      const todoList = await $.getJSON('TodoList.json');
      App.contracts.TodoList = TruffleContract(todoList);
      App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
      App.todoList = await App.contracts.TodoList.deployed();
      console.log(App.todoList);
      },
    render: async() => {
      if(App.loading)
      return;
      App.setLoading(true);
      $('#account').html(App.account);
      await App.renderTask();
      App.setLoading(false);
    },
    createTask : async()=>{
      App.setLoading(true);
      const content = $('#newTask').val();
      console.log('content')
      await App.todoList.createTask(content, {from: App.account});
      window.location.reload();
    },
    toggleCompleted:async (e) =>{
      App.setLoading(true);
      const taskId = e.target.name;
      await App.todoList.toggleCompleted(taskId, {from: App.account});
      window.location.reload();
    },
    setLoading: (bool)=>{
      App.loading = bool;
      const loader = $('#loader');
      const content = $('#list');
      console.log(content);
      if (bool){
        content.hide();
        loader.show();
        
      }
      else{
        loader.hide();
        content.show();
      }


    },
    renderTask: async()=>{
      // load task count
      const taskCount = await App.todoList.taskCount();
      const _taskTemplate = $('#taskTemplate');
      // render 
      const task_ul = $('#taskList');
      for (var i = 1;i<=taskCount;i++) {
        const task = await App.todoList.tasks(i);
        const taskID = task[0].toNumber();
        const taskContent = task[1];
        const taskCompleted = task[2];
        const new_taskTemplate = _taskTemplate.clone();
        new_taskTemplate.find('.content').html(taskContent);
        new_taskTemplate.find('input')
                        .prop('name',taskID)
                        .prop('checked',taskCompleted)
                        .on('click',App.toggleCompleted)
        


        if (taskCompleted) {
          $('#completedTaskList').append(new_taskTemplate)
        } else {
          $('#taskList').append(new_taskTemplate)
        }
        new_taskTemplate.show();

      }

    }



}
window.onload = () => {
    App.load();
  };



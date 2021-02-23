const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },

    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }

}

const Storage = {
    //convert String to Array
    get() {
        return  JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    //convert Array to String 
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        
        Transaction.all.forEach(function(transaction) {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach(function(transaction) {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
     
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclasses = transaction.amount > 0 ? "income" : "expense"
        
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclasses}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" title="Remover transação" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('income-display').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expense-display').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('total-display').innerHTML = Utils.formatCurrency(Transaction.total())
        
        if(Transaction.total() < 0){
            document.querySelector('.card.total').classList.add('negative')
        }else{
            document.querySelector('.card.total').classList.remove('negative')
        }

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    },

    addAlertRow(){

        // contains only end row
        console.log(this.transactionsContainer.childElementCount)
        if(this.transactionsContainer.childElementCount === 0){
            console.log("exibir alert row")
            const tr = document.createElement('tr')
            tr.innerHTML = `
          
            <td width="100%" >Você não realizou nenhuma transação até o momento!</td>

            `
            DOM.transactionsContainer.appendChild(tr)
        }

    },

    addEndRow(){
        const tr = document.createElement('tr')
        tr.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
        `

        tr.classList.add('end-table')

        DOM.transactionsContainer.appendChild(tr)
    }
}

const Utils = {

    formatAmount(value) {
        //replace . and , to ""
        // substituindo .(ponto) e ,(vírgula) por vazio ("")
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "+"

        //find everything that is not a number and replace it with an empty one
        //procurando tudo que não seja número e substituindo por vazio
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
    
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos.")
        }
    },
    
    formatValues() {
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event) {
        event.preventDefault()
        
        try{

            Form.validateFields()

            const transaction = Form.formatValues()
            
            Transaction.add(transaction)

            Form.clearFields()

            Modal.close()

        }catch(error){
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(function(transaction, index){
            DOM.addTransaction(transaction, index)
        })
        DOM.addAlertRow()
        DOM.addEndRow()

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
       
        App.init()
    }
}


App.init()
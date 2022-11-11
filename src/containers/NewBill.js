import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"


export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    //console.log("store", this.store)
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    /*function handleChangeFile(){
      return exports.ifForTest();
    }*/
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    //console.log("handleChangeFile-vrai")
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    //const file2 = this.document.querySelector(`input[data-testid="file"]`);
    //const filePath = e.target.value.split(/\\/g);
    // const filePath = e.target.value.split(/\\/g);
    const filePath = e.target.files[0].name.split(/\\/g);
    //console.log(filePath);
    const fileName = filePath[filePath.length-1];
    //console.log(fileName);
    //console.log(this.document.querySelector(`input[data-testid="file"]`).value)
    const fileType = fileName.split('.').pop();


    /*if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png") {
      //console.log("la valeur du champs est réinitialisée")
      this.consoleLog = console.log("la valeur du champs est réinitialisée");
      //alert("Le justificatif n'est pas une image jpg, jpeg ou png! Il ne sera donc pas accepté. Veuillez charger un justificatif au format jpg, jpeg ou png.");
      // e.target.value = "";
      this.document.querySelector(`input[data-testid="file"]`).value = ""

      return;

    }*/
        

    if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png") {
      this.ifForTest(e);
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);

    //console.log(formData)
    //console.log(this.store)

    this.store
      .bills()
      console.log(this.store.bills)
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        //console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
        this.fileType = fileType
      }).catch(error => console.error(error));
  }

  /* istanbuuul ignore next */
  ifForTest = (e) => {
    console.log("la valeur du champs est réinitialisée")
    //alert("Le justificatif n'est pas une image jpg, jpeg ou png! Il ne sera donc pas accepté. Veuillez charger un justificatif au format jpg, jpeg ou png.");
    e.target.value = ""
  }

  
  handleSubmit = e => {
    e.preventDefault()
    //console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const user = JSON.parse(window.localStorage.getItem("user"))
    //console.log("user", user)
    const email = user.email

    //console.log("localStorage", window.localStorage.getItem("user"))
    //console.log("JSON.parse", JSON.parse(window.localStorage.getItem("user")))
    //console.log("email", email)
    const bill = {
      email: email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    //console.log("Bill", bill)
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}

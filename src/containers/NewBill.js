import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
import NewBillUI from "../views/NewBillUI.js" //ajout


export default class NewBill {
  constructor({ document, onNavigate, store, bills/*ajout*/, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    //console.log("handleChangeFile-vrai")
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const filePath = e.target.files[0].name.split(/\\/g);
    const fileName = filePath[filePath.length-1];
    const fileType = fileName.split('.').pop();

    //console.log("fileName", fileName)
    //console.log("fileType",fileType)
    if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png") {

      this.consoleLog = console.log("la valeur du champs est réinitialisée");
      this.clearInputFile();

      return;

    }
        

    /*if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png") {
      this.ifForTest(e);
      return;
    }*/

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => { 
        this.setBillFile({fileUrl, key, fileName, fileType});
      }).catch(error => console.error(error));
  }

  setBillFile = ({fileUrl, key, fileName, fileType}) => {
    this.billId = key
    this.fileUrl = fileUrl
    this.fileName = fileName
    this.fileType = fileType
  }

  clearInputFile = () => {
    this.document.querySelector(`input[data-testid="file"]`).value = ""
  }



  /*ifForTest = (e) => {
    console.log("la valeur du champs est réinitialisée")
    e.target.value = ""
  }*/

  
  handleSubmit = e => {
    e.preventDefault()
    const user = JSON.parse(window.localStorage.getItem("user"))
    const email = user.email
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

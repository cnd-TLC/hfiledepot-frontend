import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';
import PrTemplate from "@/assets/templates/a1geHJRFRtRExjUabVgC.dat";
import ItemsCatalogTemplate from "@/assets/templates/k9LmNQOZpWvRbYcFsJTd.dat";
import axios from 'axios'


export const formatNumber = (number) => {
	number = parseFloat(number).toFixed(2)
	let numStr = number.toString();
    let parts = numStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export const generateRandomString = (length) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let randomString = ''
	for (let i = 0; i < length; i++) {
	    const randomIndex = Math.floor(Math.random() * charset.length)
	    randomString += charset[randomIndex]
	}
	return randomString
}

export const downloadBlob = (res) => {
	let filename = generateRandomString(20)

	const blob = new Blob([res.data], { type: res.headers['content-type'] })
  saveAs(blob, filename);
}

export const downloadPr = async (data, items) => {
	try {
		const response = await axios.get(PrTemplate, { responseType: 'blob' })
        if (response.status !== 200) 
          throw new Error('Failed to fetch PDF')

		const existingPdfBytes = await response.data.arrayBuffer()

		const pdfDoc = await PDFDocument.load(existingPdfBytes)

		const form = pdfDoc.getForm()
		form.getTextField('department').setText(data.department ? data.department : '')
		form.getTextField('purpose').setText(data.purpose ? data.purpose : '')
		form.getTextField('fund').setText(data.fund ? data.fund : '')
		form.getTextField('fpp').setText(data.fpp ? data.fpp : '')
		form.getTextField('date').setText(data.created_at ? data.created_at : '')
		form.getTextField('section').setText(data.section ? data.section : '')
		form.getTextField('pr_no').setText(data.pr_no ? data.pr_no : '')

		let tableFields = form.getFields()
		let ctr = 0
		tableFields = tableFields.map((f) => f.getName())
		
		items.value.forEach((item) => {
    	form.getTextField(`item_no[${ctr}]`)
    				.setText(item.item_no.toString())
    	form.getTextField(`unit[${ctr}]`)
    				.setText(item.unit ? item.unit.toString() : '')
    	form.getTextField(`item_description[${ctr}]`)
    				.setText(item.item_description.toString())
    	form.getTextField(`quantity[${ctr}]`)
    				.setText(item.lumpsum ? 'Lumpsum' : item.quantity.toString())
    	form.getTextField(`unit_cost[${ctr}]`)
    				.setText(`Php ${formatNumber(item.unit_cost).toString()}`)
    	form.getTextField(`total_cost[${ctr}]`)
    				.setText(`Php ${item.lumpsum ? formatNumber(item.unit_cost).toString() : formatNumber(item.unit_cost * item.quantity).toString()}`)
			ctr++
    })	

		pdfDoc.getForm().flatten()
    const pdfBytesWithFieldsFilled = await pdfDoc.save()
    let pdfBytes = pdfBytesWithFieldsFilled

    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    let filename = generateRandomString(20)
    saveAs(blob, filename + '-pr.pdf')
	}
	catch (err) {
		console.log('Printing template error: ', err)
	}
}

export const downloadItemsCatalogTemplate = async () => {
	try {
		const response = await axios.get(ItemsCatalogTemplate, { responseType: 'blob' })
        if (response.status !== 200) 
          throw new Error('Failed to fetch XLSX')

    let filename = generateRandomString(20)

		const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
		saveAs(blob, filename + '.xlsx')
	}
	catch (err) {
		console.log('Printing template error: ', err)
	}
}
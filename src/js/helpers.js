import moment from 'moment';
import _ from 'underscore';
import data from '../../data';

function objectifyFormData(form) {
	const formData = new FormData(form);
	
	function toObject(object, [key, value]) {
		object[key] = translate(value, data.dictionary);
		return object
	}

	return [...formData].reduce(toObject, {})
}

function jsonifyFormData(form) {
	const formData = new FormData(form);

	function toObject(object, [key, value]) {
		object[key] = value;
		return object
	}

	const dataObject = [...formData].reduce(toObject, {})

	return JSON.stringify(dataObject) 
}
	
function clearInnerHTML(element) {
	while (element.childNodes.length > 0) {
		element.removeChild(element.lastChild)
	}
}

function isDateValid(date, dateFormat) {
	return moment(date, dateFormat, true).isValid();	
}

function getAge(date, dateFormat) {
	const bday = moment(date, dateFormat);
	return moment().diff(bday, 'years')
}

function transliterate(input) {
	const letterAssociations = {
		"а": "a",
		"б": "b",
		"в": "v",
		"г": "g",
		"д": "d",
		"е": "e",
		"ё": "yo",
		"ж": "zh",
		"з": "z",
		"и": "i",
		"й": "i",
		"к": "k",
		"л": "l",
		"м": "m",
		"н": "n",
		"о": "o",
		"п": "p",
		"р": "r",
		"с": "s",
		"т": "t",
		"у": "u",
		"ф": "f",
		"х": "h",
		"ц": "c",
		"ч": "ch",
		"ш": "sh",
		"щ": "sh",
		"ъ": "",
		"ы": "i",
		"ь": "",
		"э": "e",
		"ю": "yu",
		"я": "ya",
		"А": "A",
		"Б": "B",
		"В": "V",
		"Г": "G",
		"Д": "D",
		"Е": "E",
		"Ё": "Yo",
		"Ж": "Zh",
		"З": "Z",
		"И": "I",
		"Й": "I",
		"К": "K",
		"Л": "L",
		"М": "M",
		"Н": "N",
		"О": "O",
		"П": "P",
		"Р": "R",
		"С": "S",
		"Т": "T",
		"У": "U",
		"Ф": "F",
		"Х": "H",
		"Ц": "C",
		"Ч": "Ch",
		"Ш": "Sh",
		"Щ": "Sh",
		"Ъ": "",
		"Ы": "I",
		"Ь": "",
		"Э": "E",
		"Ю": "Yu",
		"Я": "Ya",
	};
	
	if (!input) {
      return '';
    }

	let transliterated = ""

	for (let i = 0; i < input.length; i++) {
		const newLetter = letterAssociations[input[i]];
		
		if (typeof newLetter == 'undefined') {
			transliterated += input[i];
		} else if (newLetter.length == 0) {
			continue	
		} else {
			transliterated += newLetter;
		}
		
	}

	return transliterated;
}

function isValidEmail(item) {
	const emailRegEx = /\S+@\S+\.\S{2,}/;
	return item.match(emailRegEx)				
}

function isValidTel(item) {
	const phoneRegEx = /\+?\d{11,}/;
	const phoneChars = /[+()\s-]/g;
	return item.replace(phoneChars, '').match(phoneRegEx)
}

function translate(item, dictionary) {
	return _.contains(_.keys(dictionary), item) ? dictionary[item] : item
}

export { objectifyFormData, jsonifyFormData, clearInnerHTML, isDateValid, isValidEmail, isValidTel, transliterate, getAge }

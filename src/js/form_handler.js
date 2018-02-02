import $ from 'jquery';
import _ from 'underscore';
import * as helpers from './helpers';
import data from '../../data';
import Inputmask from "inputmask";

export default () => {
	'use strict';
	
	const spreadsheet = 'https://script.google.com/macros/s/AKfycbxNRHKF3t1Xs1tt7Py8N42rqkg89v3fMfWmEDO_Hy96SLBO4th3/exec';
	const form = document.querySelector('.js-form');

	form.addEventListener('submit', submitForm);
	
	addAutoNameTranslit(form);
	addMaritalStatusAdjust(form);
	addBdayHandler(form);
	addEmailAndTelValidation(form);
	addAllFieldsValidation(form);
	addButtonVisualHandler(form);

	restoreUserInput(form);
	saveUserInput(form);	

	function submitForm(e) {
		e.preventDefault();

		$.ajax({
			url: spreadsheet,
			method: "GET",
			dataType: "json",
			data: helpers.objectifyFormData(form),
			success: console.log('yay')
		});
	}

	function addAutoNameTranslit(form) {
		const nameField = form.querySelector('[name="name"]');
		const surnameField = form.querySelector('[name="surname"]');
		const nameFieldLat = form.querySelector('[name="name_lat"]');
		const surnameFieldLat = form.querySelector('[name="surname_lat"]');
		
		form.addEventListener('input', autoTransliterateName);		
		
		function autoTransliterateName(e) {
			function pasteTranslit(from, to) {
				to.value = helpers.transliterate(from.value)
			}

			switch(e.target) {
				case nameField:
					pasteTranslit(nameField, nameFieldLat);
					break;
				case surnameField:
					pasteTranslit(surnameField, surnameFieldLat);
					break;
				default:
					break
			}
		}
	}

	function addMaritalStatusAdjust(form) {
		const selectorsSex = [...form.querySelectorAll('[name="sex"]')];
		const selectorMaritalStatus = form.querySelector('[name="marital-status"]');
		const maritalStatus = data.maritalStatus;

		selectorsSex.forEach(adjustMaritalStatusOptions);

		function adjustMaritalStatusOptions(selector) {
			selector.addEventListener('change', adjustOptions)

			function adjustOptions(e) {
				if (e.target.checked) {
					setOptionsTo(e.target.value);
				}
			}

			function setOptionsTo(sex) {
				helpers.clearInnerHTML(selectorMaritalStatus);
				maritalStatus[sex].forEach(status => {
					const option = document.createElement('option');
					option.value = status;
					option.textContent = status;
					selectorMaritalStatus.appendChild(option)
				})
			}
		}	
	}

	function addBdayHandler(form) {
		const bday = form.querySelector('[name="bday"]');
		const bdayDay = form.querySelector('[name="bday-day"]');
		const bdayMonth = form.querySelector('[name="bday-month"]');
		const bdayYear = form.querySelector('[name="bday-year"]');
		const dateFormat = 'DD.MM.YYYY';

		form.addEventListener('change', handleBday);

		function handleBday(e) {
			const input = e.target;
			
			if (input === bdayDay || e.target === bdayMonth || e.target === bdayYear) {
				touch(input);
				let day = bdayDay.value;
				
				if (bdayDay.value != 'null' && parseInt(day) < 10) {
					day = `0${bdayDay.value}`
				}
				
				const bdayDate = `${day}.${bdayMonth.value}.${bdayYear.value}`;			
	
				const isValid = helpers.isDateValid(bdayDate, dateFormat);

				bday.value = bdayDate;
				const age = helpers.getAge(bday.value, dateFormat);
				
				bday.dataset.valid = isValid && age < 90;


				if (!isValid && allDateFieldsSet()) {
					warnUser('wrongBday');
				} else if (!isValid && !allDateFieldsSet() && allDateFieldsTouched()) {
					warnUser('missingBdayPart');
				} else if (age >= 90) {
					warnUser('tooOldToGo', bday)
				} else if (isValid && age < 90 && bday.dataset.tooOld) {
					removeNoticeForOldPeople(bday)
				} 

				function allDateFieldsSet() {
					return bdayDay.value != 'null' && bdayMonth.value != 'null' && bdayYear.value != 'null'
				}

				function allDateFieldsTouched() {
					return bdayDay.dataset.touched && bdayMonth.dataset.touched && bdayYear.dataset.touched
				}
			}
		}
	}

	function addEmailAndTelValidation(form) {
		const emailField = form.querySelector('[name="email"]');
		const telField = form.querySelector('[name="tel"]');

		const telMask = new Inputmask("+7(999)999-99-99");
		telMask.mask(telField);
		
		emailField.addEventListener('blur', checkValidity);
		telField.addEventListener('blur', checkValidity);
		form.addEventListener('input', checkValidity);

		function checkValidity(e) {
			const input = e.target;

			if (input === emailField || input === telField) {
			
				if (e.type === 'blur') {
					touch(input);
				}

				let isValid;

				if (input === emailField) {
					isValid = Boolean(helpers.isValidEmail(input.value));
				} else if (input === telField) {
					isValid = Boolean(helpers.isValidTel(input.value));
				}
				
				input.dataset.valid = isValid;
				
				if (!isValid) {
					warnUser('invalidData', input)
				} else if (input.classList.contains('invalid')) {
					input.classList.remove('invalid')
				}
			}
		} 
	}

	function addAllFieldsValidation(form) {
		const submit = form.querySelector('.js-submit-form')
		const allInputs = [...form.querySelectorAll('input, select')];		
		const required = _.filter(allInputs, isRequired);

		function isRequired(input) {
			return _.contains(data.required, input.name)
		}

		form.addEventListener('change', checkValidity);
		form.addEventListener('input', checkValidity);

		function checkValidity() {
			const allValid = required.reduce(toAllValid, true);
			allValid ? submit.removeAttribute('disabled') : submit.disabled = true;

			function toAllValid(allValid, input) {
				if (!allValid) {
					return false;
				} 

				if (input.dataset.valid === 'false') {
					return false
				} else if (!input.value || input.value == 'null') {
					return false
				} else if (input.name === "agrees" && !input.checked) {
					return false
				}

				return allValid
			}
		}
	}

	function addButtonVisualHandler(form) {
		const radioGroups = [...form.querySelectorAll('.js-radiogroup')];
		radioGroups.forEach(group => {
			group.addEventListener('click', (e) => {
				showSelected(e, group)
			});
		});
			
		function showSelected(e, group) {
			const button = e.target.classList.contains('button') ? e.target : null;
			const allButtons = [...group.querySelectorAll('.button')];
			
			if (button) {
				allButtons.forEach(btn => {
					if (btn.classList.contains('checked') && btn != button) {
						btn.classList.remove('checked')
					} else if (!button.classList.contains('checked') && btn == button) {
						btn.classList.add('checked')
					}	
				})				
			}
		}	
	}

	function saveUserInput(form) {
		form.addEventListener('input', () => {
			saveInput(form)
		});

		form.addEventListener('change', () => {
			saveInput(form)
		});
		

		function saveInput(form) {
			const json = helpers.jsonifyFormData(form)
			localStorage.setItem('data', json)
		}
	}

	function restoreUserInput(form) {
		const inputs = [...form.querySelectorAll('input, select')];
		
		if (localStorage.data) {
			const data = JSON.parse(localStorage.data);
			restoreValues(inputs, data);
		}

		function restoreValues(inputs, data) {
			inputs.forEach(input => {
				const value = data[input.name];
				
				const changeEvent = new Event('change', {
					'bubbles': true,
					'cancelable': true
				});				
				const inputEvent = new Event('input', {
					'bubbles': true,
					'cancelable': true
				});

				if (value) {
					if (input.tagName === 'SELECT') {
						input.value = value;
						input.dispatchEvent(changeEvent)								
					} else {
						
						switch(input.type) {
							case 'radio':
								const label = form.querySelector(`[for=${value}]`);
								label ? label.click() : input.click();
								break;
							case 'checkbox':
								if (value == input.value) {									
									const label = form.querySelector(`[for=${input.id}]`);
									label ? label.click() : input.click();	
								}
								break;
							case 'hidden':
								break
							default:
								input.value = value;
								input.dispatchEvent(inputEvent)
								break
						}						
					}
				}
			})
		}
	}

	function warnUser(problem, input) {
		switch(problem) {
			case 'wrongBday':
				console.log('wrong Bday');
				break;
			case 'missingBdayPart':
				console.log('missingBdayPart');
				break;
			case 'tooOldToGo':
				showNoticeForOldPeople(input)
				break;			
			case 'invalidData':
				if (input.dataset.touched && !input.classList.contains('invalid')) {
					input.classList.add('invalid');
				}
				break;
			default:
				break;
		} 
	}

	function showNoticeForOldPeople(input) {
		const field = form.querySelector('.js-bday-wrapper');
		const notice = form.querySelector('.notice-for-old')
		field.classList.add('attention');
		notice.classList.remove('hidden');
		input.setAttribute("data-too-old", "true");
	}

	function removeNoticeForOldPeople(input) {
		const field = form.querySelector('.js-bday-wrapper');
		const notice = form.querySelector('.notice-for-old')
		field.classList.remove('attention');
		notice.classList.add('hidden');
		input.removeAttribute("data-too-old");
	}

	function touch(field) {
		if (!field.dataset.touched) {
			field.dataset.touched = 'true'
		}
	}
}

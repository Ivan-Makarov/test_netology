const data = {
	head: {
		title: "Тестовое задание для Нетологии",
		//base: "http://ivanmakarov.xyz/portfolio/test_netology/"
	},

	maritalStatus: {
		male: [
			'',
			'женат',
			'в «гражданском браке»',
			'разведен',
			'холост',
			'вдовец'
		],
		female: [
			'',
			'замужем',
			'в «гражданском браке»',
			'разведена',
			'не замужем',
			'вдова'
		],
	},

	education: [
		'',
		'высшее',
		'среднее специальное',
		'среднее',
		'студент'
	],

	months: [
		{
			text: 'января',
			value: '01'
		},
		{
			text: 'февраля',
			value: '02'
		},
		{
			text: 'марта',
			value: '03'
		},
		{
			text: 'апреля',
			value: '04'
		},
		{
			text: 'мая',
			value: '05'
		},
		{
			text: 'июня',
			value: '06'
		},
		{
			text: 'июля',
			value: '07'
		},
		{
			text: 'августа',
			value: '08'
		},
		{
			text: 'сентября',
			value: '09'
		},
		{
			text: 'октября',
			value: '10'
		},
		{
			text: 'ноября',
			value: '11'
		},
		{
			text: 'декабря',
			value: '12'
		},
	],

	required: [
		'surname',
		'name',
		'surname_lat',
		'name_lat',
		'bday',
		'marital-status',
		'education',
		'tel',
		'email',
		'agrees'
	],

	dictionary: {
		male: 'мужчина',
		female: 'женщина'
	}
}

export default data

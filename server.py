from flask import Flask
from flask_ask import Ask, statement, question, session
from flask_socketio import SocketIO, emit, send

import requests
import urllib
import json
import enchant


app = Flask(__name__)
app.config['SECRET_KEY'] = 'echonative'
socketio = SocketIO(app)
ask = Ask(app, '/')


def text2int(textnum, numwords={}):
    if not numwords:
      units = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
        "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        "sixteen", "seventeen", "eighteen", "nineteen",
      ]

      tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

      scales = ["hundred", "thousand", "million", "billion", "trillion"]

      numwords["and"] = (1, 0)
      for idx, word in enumerate(units):    numwords[word] = (1, idx)
      for idx, word in enumerate(tens):     numwords[word] = (1, idx * 10)
      for idx, word in enumerate(scales):   numwords[word] = (10 ** (idx * 3 or 2), 0)

    current = result = 0
    for word in textnum.split():
        if word not in numwords:
          raise Exception("Illegal word: " + word)

        scale, increment = numwords[word]
        current = current * scale + increment
        if scale > 100:
            result += current
            current = 0

    return result + current


def camelCase(attribute):
	attribute = ''.join(x for x in attribute.title() if not x.isspace())
	attribute = attribute[0].lower() + attribute[1:]
	return attribute


def getImageUrlFromText(text):
	params = { 'key': '4982142-9f7b1a40f4655c14043f75ec6', 'q':text.strip() }
	r = requests.get('https://pixabay.com/api', params=params)
	response = json.loads(r.text)
	return response['hits'][0]['webformatURL']


def mapToCorrect(text):
	text = text.replace('imput', 'input').replace('patting', 'padding').replace('with', 'width')
	try:
		d = enchant.Dict("en_US")
		new_text = ''
		for word in text.split(' '):
			if d.check(word):
				new_text += word + ' '
			else:
				d.suggest(word)[0]
		return new_text.strip()
	except:
		return text
	return text


@app.route('/')
def index():
	return 'running...'




@socketio.on('connect')
def handle_message():
	print 'hello'
	# emit('add', '{ "type": "text" , "value": "websocket string", "className": "instructions" }')


@ask.launch
def welcome():
	# return question('Welcome to Echo Native. You can create a new application or edit and existing one.')
	return question('yes')


@ask.intent('CreateAppIntent', convert={'name': str})
def createApp(name):
	if name is not None:
		app_name = name.replace(' ', '-')
		return statement('creating application '+name)
	return statement("sorry I didn't catch that")


@ask.intent('AddComponentIntent', convert={'component': str, 'name': str, 'parent': str})
def addComponent(component, name, parent):
	print 'ADDING'
	if component is not None and name is not None:
		print component + ' ' + name
		addParent = ''
		if parent is not None:
			addParent = ', "parent": "'+parent+'"'

		name = mapToCorrect(name)

		print component + ' ' + name

		socketio.emit('add', '{ "type": "'+camelCase(component)+'", "className": "'+name.split(' ')[len(name.split(' '))-1]+'"'+addParent+' }')
		return question('Done. Anything else?')
	return statement("sorry I didn't catch that")


@ask.intent('SetContentIntent', convert={'name': str, 'text': str})
def putContent(name, text):
	print 'SETTING'
	if text is not None and name is not None:
		print name + ' ' + text
		prop = 'text'
		for word in text.split(' '):
			if word == 'image':
				text = getImageUrlFromText(text.split(' ')[len(text.split(' '))-1])
				prop = 'source'
				break
	
		name = mapToCorrect(name)
		text = mapToCorrect(text)

		print name + ' ' + text

		socketio.emit('set', '{ "className": "'+name.split(' ')[len(name.split(' '))-1]+'", "property":"'+prop+'", "value": "'+text+'" }')
		return question('Done. Anything else?')
	return statement("sorry I didn't catch that")


@ask.intent('UpdateComponentIntent', convert={'name': str, 'attribute': str, 'value': str})
def updateComponent(name, attribute, value):
	print 'UPDATING'
	if name is not None and attribute is not None and value is not None:
		print name + ' ' + attribute + ' ' + value
		attribute = camelCase(attribute)
		try:
			value = str(text2int(value.replace('percent', '').strip()))+'%'
		except:
			pass

		name = mapToCorrect(name)
		value = mapToCorrect(value)
		attribute = attribute.replace('imput', 'input').replace('patting', 'padding').replace('with', 'width').replace('marginTalk', 'marginTop').replace('flexStart', 'flex-start').replace('flexEnd', 'flex-end')

		print name + ' ' + attribute + ' ' + value

		socketio.emit('set', '{ "className": "'+name.split(' ')[len(name.split(' '))-1]+'", "property":"'+attribute+'", "value": "'+value+'" }')
		return question('Done. Anything else?')
	return statement("sorry I didn't catch that")



@ask.intent('ResizeComponentIntent', convert={'attribute': str, 'name': str, 'value': str})
def resizeComponent(attribute, name, value):
	print 'RESIZING'
	if name is not None and attribute is not None and value is not None:
		print name + ' ' + attribute + ' ' + value
		attribute = camelCase(attribute)
		try:
			value = str(text2int(value.replace('percent', '').strip()))+'%'
		except:
			pass

		name = mapToCorrect(name)
		attribute = mapToCorrect(attribute)
		value = mapToCorrect(value)

		print name + ' ' + attribute + ' ' + value

		socketio.emit('set', '{ "className": "'+name.split(' ')[len(name.split(' '))-1]+'", "property":"'+attribute+'", "value": "'+value+'" }')
		return question('Done. Anything else?')
	return statement("sorry I didn't catch that")






@ask.intent('DestroyComponentIntent', convert={'name': str})
def destroyComponent(name):
	print 'DESTROYING'
	if name is not None:
		name = mapToCorrect(name)
		socketio.emit('destroy', '{ "className": "'+name.split(' ')[len(name.split(' '))-1]+'" }')
		return question('Done. Anything else?')
	return statement("sorry I didn't catch that")




@ask.intent('StopIntent')
def stop():
	return statement('goodbye')


if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=80, debug=True)
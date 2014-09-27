var XML_CONFIG = '\
<level spawn="600">\
	<room name="hall" width="840">\
		<object sprite="door" scroll="40" disabled="true">\
		</object>\
		<object sprite="door" scroll="400">\
			<action name="interact" type="level" index="1" scroll="240">\
			</action>\
		</object>\
		<object sprite="door" scroll="780" disabled="true">\
		</object>\
	</room>\
	<room width="320" type="red">\
		<object sprite="door" scroll="240">\
			<action name="interact" type="level" index="0" scroll="400">\
			</action>\
		</object>\
	</room>\
</level>\
';
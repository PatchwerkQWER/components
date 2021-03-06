COMPONENT('splashscreen', 'timeout:3000;autoremove:1', function(self, config, cls) {

	var cls2 = '.' + cls;

	self.readonly();
	self.singleton();

	self.make = function() {

		if (config.remember) {
			var val = CACHE(self.ID);
			if (val) {
				self.rclass(cls);
				self.remove();
				return;
			}
			CACHE(self.ID, '1', config.remember);
		}

		self.aclass(cls);
		self.html('<div><div class="{0}-body">{1}</div></div>'.format(cls, self.find('script').html()));
		self.show();
	};

	self.show = function(body) {

		body && self.find(cls2 + '-body').html(body);
		self.rclass('hidden invisible');

		setTimeout(function() {
			self.aclass(cls + '-animate');
		}, 100);

		setTimeout(function() {
			self.aclass(cls + '-removing');
			setTimeout(function() {
				if (config.autoremove)
					self.remove();
				else
					self.aclass('hidden');
				self.rclass(cls + '-removing', 100);
			}, 500);
		}, config.timeout);
	};

});
COMPONENT('resource', function(self) {

	self.readonly();
	self.blind();
	self.nocompile();

	self.init = function() {
		W.RESOURCEDB = {};
		W.RESOURCE = function(name, def) {
			return W.RESOURCEDB[name] || def || name;
		};
	};

	self.download = function(url, callback) {
		AJAX('GET ' + url, function(response) {
			if (!response) {
				callback && callback();
				return;
			}

			if (typeof(response) !== 'string')
				response = response.toString();
			self.prepare(response);
			callback && callback();
		});
	};

	self.prepare = function(value) {

		var arr = value.split('\n');

		for (var i = 0; i < arr.length; i++) {

			var clean = arr[i].trim();
			if (clean.substring(0, 2) === '//')
				continue;

			var index = clean.indexOf(':');
			if (index === -1)
				return;

			var key = clean.substring(0, index).trim();
			var value = clean.substring(index + 1).trim();

			W.RESOURCEDB[key] = value;
		}

		return self;
	};

	self.make = function() {
		var el = self.find('script');
		self.prepare(el.html());
		el.remove();
	};
});
init:
	yarn install
	bower install
	make build

build:
	gulp

build-prod:
	gulp --production

watch:
	gulp watch

clean:
	gulp clean
	rm -rf bower_components node_modules

var angularConfigurationManager = angular.module('angularConfigurationManager', []);

angularConfigurationManager.factory(
    'ConfigurationManager', function () {
        var ConfigurationManager = {
            mergeObjects : function (target, src) {
                var array = Array.isArray(src);
                var dst = array && [] || target;

                if (target && typeof target === 'object') {
                    Object.keys(target).forEach(
                        function (key) {
                            dst[key] = target[key];
                        }
                    )
                }
                Object.keys(src).forEach(
                    function (key) {
                        if (typeof src[key] !== 'object' || !src[key]) {
                            dst[key] = src[key];
                        }
                        else {
                            if (!target[key]) {
                                dst[key] = src[key];
                            } else {
                                dst[key] = ConfigurationManager.mergeObjects(target[key], src[key]);
                            }
                        }
                    }
                );

                return dst;
            },
            createNewConfiguration : function () {
                var Configuration = {
                    _environmentConfiguration : {},
                    _additionalConfigurations : []
                };

                return Configuration;
            },
            addEnvironmentConfiguration : function (currentConfiguration, environment, environmentConfiguration) {
                if (typeof environmentConfiguration === 'object') {
                    currentConfiguration._environmentConfiguration[environment] = environmentConfiguration;
                }
            },
            resetConfiguration : function (currentConfiguration) {
                Object.keys(currentConfiguration).forEach(
                    function (key) {
                        if (!['_environmentConfiguration', '_additionalConfigurations'].includes(key)) {
                            delete currentConfiguration[key];
                        }
                    }
                )
            },
            loadEnvironment : function (currentConfiguration, environment) {
                ConfigurationManager.resetConfiguration(currentConfiguration);
                ConfigurationManager.mergeObjects(
                    currentConfiguration,
                    currentConfiguration._environmentConfiguration[environment]
                );
            },
            reloadAdditionalConfiguration : function (currentConfiguration) {
                for (var i in currentConfiguration._additionalConfigurations) {
                    if (currentConfiguration._additionalConfigurations.hasOwnProperty(i)) {
                        ConfigurationManager.mergeObjects(
                            currentConfiguration,
                            currentConfiguration._additionalConfigurations[i]
                        );
                    }
                }
            },
            applyConfiguration : function (currentConfiguration, additionalConfiguration) {
                if (typeof additionalConfiguration === 'object') {
                    currentConfiguration._additionalConfigurations.push(additionalConfiguration);
                    ConfigurationManager.mergeObjects(currentConfiguration, additionalConfiguration);
                }
            }
        };

        return ConfigurationManager;
    }
);
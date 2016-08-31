# angular-configuration-manager
Environment and local configuration manager used by teams working on the same angular (or Ionic) project.

## Install

```
bower install angular-configuration-manager --save
```

Add `angularConfigurationManager` to your application modules.

Include `angular-configuration-manager.js`.

## Basic setup

You will need at least those three steps to create a configuration :

1. Create the configuration object
```javascript
    var Configuration = ConfigurationManager.createNewConfiguration();
```

2. Add environment specific configuration
```javascript
    // Initial DEV configuration
    ConfigurationManager.addEnvironmentConfiguration(
        Configuration,
        'dev',
        {
            api : {
                url : 'http://localhost/api'
            },
            debug : true
        }
    );
```

3. Load environment specific configuration

```javascript
    ConfigurationManager.loadEnvironment(Configuration, 'dev');
```

Now you can use the configuration object as follows :

```javascript
    var url = Configuration.api.url;
    var debug = Configuration.debug;
```

## Add custom configuration

You are able to add custom configuration which will be merged on top of current environment configuration :

```javascript
    var Configuration = ConfigurationManager.createNewConfiguration();

    // Initial DEV configuration
    ConfigurationManager.addEnvironmentConfiguration(
        Configuration,
        'dev',
        {
            api : {
                url : 'http://localhost/api'
            },
            debug : true
        }
    );

    ConfigurationManager.loadEnvironment(Configuration, 'dev');

    // Adds custom configuration through a merge
    ConfigurationManager.applyConfiguration(
        Configuration,
        {
            // WRITE YOUR CONFIGURATION HERE
            debug : false,
            test : 'test'
        }
    );
```

After that, the configuration will look like this :

```javascript
    {
        api : {
            url : 'http://localhost/api'
        },
        debug : false,
        test : 'test'
    }
```

## Global configuration

In some cases you will need a global configuration shared between environments :

```javascript
    var Configuration = ConfigurationManager.createNewConfiguration();

    // GLOBAL configuration
    ConfigurationManager.setGlobalConfiguration(
        Configuration,
        {
            iAmGlobal : true,
            debug : false
        }
    );

    // Initial DEV configuration
    ConfigurationManager.addEnvironmentConfiguration(
        Configuration,
        'dev',
        {
            api : {
                url : 'http://localhost/api'
            },
            debug : true
        }
    );

    ConfigurationManager.loadEnvironment(Configuration, 'dev');
```

After that, the configuration will look like this :

```javascript
    {
        api : {
            url : 'http://localhost/api'
        },
        debug : true,
        iAmGlobal : true
    }
```

__You could also use the global configuration alone :__

```javascript
    var Configuration = ConfigurationManager.createNewConfiguration();

    // GLOBAL configuration
    ConfigurationManager.setGlobalConfiguration(
        Configuration,
        {
            iAmGlobal : true,
            debug : false
        }
    );

    ConfigurationManager.loadGlobal(Configuration);
```

After that, the configuration will look like this :

```javascript
    {
        debug : false,
        iAmGlobal : true
    }
```

## Merge order

1. Global configuration
2. Environment configuration
3. (foreach) Previously applied additional configuration

## Functions reference

- `createNewConfiguration` : Creates new configuration object.
- `setGlobalConfiguration` : Set shared configuration between environments.
- `loadGlobal` : Resets the configuration to global configuration.
- `addEnvironmentConfiguration` : Adds/Replaces initial environment configuration.
- `loadEnvironment` : Resets the configuration to initial environment configuration.
- `applyConfiguration` : Applies custom configuration on top of the current configuration (can be used multiples times).
- `reloadAdditionalConfiguration` : Applies all previously applied custom configurations on top of the current configuration.


## Team working on the same angular with multiple environments use case

### Project configuration

Here a factory is used to simplify the configuration use in controllers.

```javascript
angular.module('YOUR_APP').factory(
    'Configuration', function (ConfigurationManager) {

        var Configuration = ConfigurationManager.createNewConfiguration();


        // Initial DEV configuration
        ConfigurationManager.addEnvironmentConfiguration(
            Configuration,
            'dev',
            {
                api : {
                    url : 'http://localhost/api'
                },
                debug : true
            }
        );


        // Initial STAGING configuration
        ConfigurationManager.addEnvironmentConfiguration(
            Configuration,
            'staging',
            {
                api : {
                    url : 'http://client.company.staging.com/api'
                },
                debug : true
            }
        );


        // Initial PRODUCTION configuration
        ConfigurationManager.addEnvironmentConfiguration(
            Configuration,
            'production',
            {
                api : {
                    url : 'https://client.com/api'
                },
                debug : false
            }
        );

        ConfigurationManager.loadEnvironment(Configuration, 'dev');

        return Configuration;
    }
);
```

Now you can use it like this :

```javascript
angular.module('YOUR_APP')
    .controller('AppController', ['Configuration', AppController]);


function AppController(Configuration) {
    console.log(Configuration);
    console.log(Configuration.api.url);
    console.log(Configuration.debug);
}
```

### Local configuration

Every developer working on the project would create a Git ignored local file which will overwrite the configuration before the controllers kick-in :

```javascript
angular.module('YOUR_APP').run(
    [
        'Configuration', 'ConfigurationManager',
        function (Configuration, ConfigurationManager) {
            ConfigurationManager.applyConfiguration(
                Configuration,
                {
                    // WRITE YOUR CONFIGURATION HERE
                    api : {
                        url : 'http://localhost:8080/api'
                    }
                }
            );
        }
    ]
);
```

This allows them to overwrite or add custom configuration without commiting it to Git.

### Server configuration

Since you have to use `ConfigurationManager.loadEnvironment(Configuration, 'XXXX');` to create the configuration, you need a way to reload the configuration when you push your code to the server without doing it manually.

You can use the `loadEnvironment` again :

```javascript
angular.module('YOUR_APP').run(
    [
        'Configuration', 'ConfigurationManager',
        function (Configuration, ConfigurationManager) {
            ConfigurationManager.loadEnvironment(Configuration, 'staging');

            ConfigurationManager.applyConfiguration(
                Configuration,
                {
                    // WRITE YOUR CONFIGURATION HERE
                    api : {
                        url : 'http://client.company.staging.com:8080/api'
                    }
                }
            );
        }
    ]
);
```

Or you can fully reload the configuration :

```javascript
angular.module('YOUR_APP').run(
    [
        'Configuration', 'ConfigurationManager',
        function (Configuration, ConfigurationManager) {
            ConfigurationManager.applyConfiguration(
                Configuration,
                {
                    // WRITE YOUR CONFIGURATION HERE
                    api : {
                        url : 'http://client.company.staging.com:8080/api'
                    }
                }
            );

            // ------------ THIS COULD BE IN ANOTHER FILE ------------
            ConfigurationManager.loadEnvironment(Configuration, 'staging');
            // You MUST reapply your custom configuration
            ConfigurationManager.reloadAdditionalConfiguration(Configuration);
        }
    ]
);
```

Now you have your staging environment configuration with all your custom configurations applied to it.
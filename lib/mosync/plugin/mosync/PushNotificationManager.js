/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var exec = require('cordova/exec');

/**
 * @file mosync-pushnotifications.js
 * @author Bogdan Iusco
 *
 * The library for supporting Push Notifications in Javascript and
 * Web applications.
 */

/**
 * This class provides access to device Push Notifications Service.
 */
var PushNotificationManager = function() {
	/**
	 * The last received push notification.
	 * @private
	 */
	this.lastPushNotificationData = null;
};

/**
 * Create a push notification object.
 *
 * @param message
 *            push notification's message.
 * @param sound
 *           push notification's sound filename.
 * @param iconBadge
 *           push notification's icon badge.
 *
 * @private
 */
var PushNotificationData = function(message, sound, iconBadge)
{
  this.message = message;
  this.sound = sound;
  this.iconBadge = iconBadge;
};

/**
 * Constants indicating the types of notifications the application accepts.
 * Specific to iOS.
 *
 * On Android alert type is set by default. Types on iOS include:
 *
 *  - badge: The application accepts notifications that badge the application icon.
 *  - sound: The application accepts alert sounds as notifications.
 *  - alert: The application accepts alert messages as notifications.
 *
 */
PushNotificationManager.type = {
		/*
		 * The application accepts notifications that badge the application icon.
		 */
		badge: 1,
		/*
		 * The application accepts alert sounds as notifications.
		 */
		sound: 2,
		/*
		 * The application accepts alert messages as notifications.
		 */
		alert: 4
	};

/**
 * Create a conection with a server.
 * Device token / application id will be send to the remote server.
 *
 * @param serverAddress
 *            server's ip address.
 * @param serverPort
 *            server's port number.
 *
 * @private
 */
PushNotificationManager.prototype.initialize = function(serverAddress, serverPort)
{
	exec(
		null,
		null,
		"PushNotification",
		"initialize",
		{
			"serverAddress": serverAddress,
			"serverPort": serverPort
		});
};

/**
 * Asynchronously starts the registration process.
 *
 * @param successCallback
 *            the function to call when registration data is available.
 * @param errorCallback
 *            the function to call if an error occured while registering.
 *
 * Example
 * -------
 * \code
 * // The application did successfuly register for receiving push notifications.
 * function push_notification_did_registered(token) {};
 *
 * // The application did not registered for receiving push notifications.
 * function push_notification_failed_to_register(error) {}
 *
 * // Create a push notification manager object.
 * var pushNotificationManager = new PushNotificationManager();
 * pushNotificationManager.register(
 *     push_notification_did_registered,
 *     push_notification_failed_to_register);
 * \endcode
 *
 */
PushNotificationManager.prototype.register = function(
		successCallback,
		errorCallback)
{
	// successCallback required
	if (typeof successCallback !== "function") {
		console.log("PushNotificationManager Error: successCallback is not a function");
		return;
	}

	// errorCallback required
	if (errorCallback && (typeof errorCallback !== "function")) {
		console.log("PushNotificationManager Error: errorCallback is not a function");
		return;
	}

	var onSuccess = function(result)
	{
		successCallback(result);
	};

	var onError = function(err)
	{
		errorCallback(err);
	};

	exec(onSuccess, onError, "PushNotification", "register", null, []);
};

/**
 * Unregister application for receiving push notifications.
 *
 * @param callback
 *            the function to call when the application has unregistered.
 *            This method is called only on Android platform.
 *
 * Example
 * -------
 * \code
 * function push_notification_did_unregister() {}
 *
 * // Create a push notification manager object.
 * pushNotificationManager.unregister(push_notification_did_unregister);
 *
 * \endcode
 *
 */
PushNotificationManager.prototype.unregister = function(callback)
{
	if (callback && (typeof callback !== "function")) {
		console.log("PushNotificationManager Error: callback is not a function");
		return;
	}

	var onSuccess = function(result)
	{
		callback();
	};

	exec(onSuccess, null, "PushNotification", "unregister", []);
};

/**
 * Set push notification allowed types.
 * Call this method before registering the application for receiving push
 * notifications.
 *
 * @param successCallback
 *           the function to call if the types were set successfuly.
 * @param errorCallback
 *           the function to call if the types param is invalid.
 * @param types
 *           types of the notifications accepted by the application.
 *           If this param is not specified the application will be registered
 *           for receiving all types of notification.
 *
 * Example
 * -------
 * \code
 *  var typesArray = [PushNotificationManager.type.badge,
 *                    PushNotificationManager.type.sound,
 *                    PushNotificationManager.type.alert];
 *
 * // Create a push notification manager object.
 * var pushNotificationManager = new PushNotificationManager();
 * pushNotificationManager.types(null, null, typesArray);
 *
 * \endcode
 */
PushNotificationManager.prototype.types = function(
	successCallback,
	errorCallback,
	types)
{
	var i;
	var onSuccess = function(result)
	{
		if (successCallback && (typeof successCallback == "function"))
		{
			successCallback(result);
		}
	};

	var onError = function(err)
	{
		if (errorCallback && (typeof errorCallback == "function"))
		{
			errorCallback(err);
		}
	};

	// Convert types param to a bitmask.
	var bitmask = 0;
	if (!types)
	{
		bitmask = PushNotificationManager.type.badge |
				  PushNotificationManager.type.sound |
				  PushNotificationManager.type.alert;
	}
	else if(typeof types == "array")
	{
		for(i in types) {
			bitmask = bitmask | types[i];
		}
	}
	else
	{
		onError("Types param is not an array");
		return;
	}

	exec(onSuccess, onError, "PushNotification", "types", bitmask, []);
};

/**
 * Set the account ID used for registering the application.
 * Call this method before registering the application.
 *
 * @param  accountID
 *             the account id authorized to send messages to the application,
 *             typically the email address of an account set up by the
 *              application's developer.
 *             Use this function only on Android platform.
 *
 * Example
 * -------
 * \code
 * // Create a push notification manager object.
 * var pushNotificationManager = new PushNotificationManager();
 * pushNotificationManager.accountID("your_account_id");
 *
 * \endcode
 */
PushNotificationManager.prototype.accountID = function(
	accountID)
{
	exec(null, null, "PushNotification", "accountID", accountID, []);
};

/**
 * Listener for push notification.
 *
 * @param callback
 *            The function to call when a new push notification is received.
 *
 * Example
 * -------
 * \code
 * function did_receive_push_notification(pushNotification)
 * {
 *     alert(pushNotification.message);
 * }
 * // Create a push notification manager object.
 * var pushNotificationManager = new PushNotificationManager();
 * pushNotificationManager.listener(did_receive_push_notification);
 *
 * \endcode
 */
PushNotificationManager.prototype.listener = function(callback)
{
	if (typeof callback !== "function") {
		console.log("PushNotificationManager Error: newPushNotificationCallback is not a function");
		return;
	}

	var self = this;

	var onSuccess = function(data)
	{
		var message = data.message ? data.message : "";
		var sound = data.sound ? data.sound : "";
		var iconBadge = data.iconBadge ? data.iconBadge : 0;
		self.lastPushNotificationData = new PushNotificationData(
			message,
			sound,
			iconBadge);
		callback(self.lastPushNotificationData);
	};

	exec(onSuccess, null, "PushNotification", "listener", []);
};

// End of Push Notification API

module.exports = PushNotificationManager;

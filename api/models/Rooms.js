/**
* Rooms.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	
        idCreator: {
            type: 'int',
            required: true
        },
        
        idInvited: {
            type: 'int',
        },
        
        name: {
            type: 'string',
            required: true,
        },
        
        petition: {
            type: 'boolean'
        },
        
        creatorName: {
            type: 'string',
            required: true
        },
        
        invitedName: {
            type: 'string',
        }
    }
};


'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doorLockEvents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      doorLockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'doorLocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        // 'OPEN' | 'CLOSE'
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'API',
        // 'API' | 'APP' | 'RFID' | 'IOT' | 'SEED'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // index para consultas por data e por fechadura
    await queryInterface.addIndex('doorLockEvents', ['doorLockId', 'createdAt']);
    await queryInterface.addIndex('doorLockEvents', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('doorLockEvents');
  },
};

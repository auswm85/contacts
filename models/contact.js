const contact = (sequelize, DataTypes) => {
  const Contact = sequelize.define("contact", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },

    contactType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Contact.associate = models => {
    Contact.belongsTo(models.User);
  };

  return Contact;
};

export default contact;

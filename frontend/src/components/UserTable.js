import React, { useState } from 'react';
import { Table, Form, Button, ButtonGroup, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { authService } from '../services/authService.js';

const UserTable = ({ users, onUsersUpdate }) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState('lastLoginTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [message, setMessage] = useState({ text: '', type: '' });

  const getUniqIdValue = (user) => user.id;

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      setSelectedUsers(new Set(users.map(user => getUniqIdValue(user))));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) {
      setMessage({ text: 'Please select at least one user', type: 'warning' });
      return;
    }

    try {
      await authService.bulkAction(Array.from(selectedUsers), action);
      setMessage({ 
        text: `${action} action completed successfully`, 
        type: 'success' 
      });
      setSelectedUsers(new Set());
      setSelectAll(false);
      onUsersUpdate();
    } catch (error) {
      setMessage({ 
        text: `Failed to ${action} users: ${error.message}`, 
        type: 'danger' 
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'danger';
      case 'unverified': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="container-fluid p-4">
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible>
          {message.text}
        </Alert>
      )}
      
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
        <div className="d-flex gap-2">
          <OverlayTrigger placement="top" overlay={<Tooltip>Block selected users</Tooltip>}>
            <Button 
              variant="warning" 
              disabled={selectedUsers.size === 0}
              onClick={() => handleBulkAction('block')}
            >
              Block
            </Button>
          </OverlayTrigger>
          
          <ButtonGroup>
            <OverlayTrigger placement="top" overlay={<Tooltip>Unblock selected users</Tooltip>}>
              <Button 
                variant="success" 
                disabled={selectedUsers.size === 0}
                onClick={() => handleBulkAction('unblock')}
              >
                ✓
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger placement="top" overlay={<Tooltip>Delete selected users</Tooltip>}>
              <Button 
                variant="danger" 
                disabled={selectedUsers.size === 0}
                onClick={() => handleBulkAction('delete')}
              >
                🗑️
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger placement="top" overlay={<Tooltip>Delete all unverified users</Tooltip>}>
              <Button 
                variant="outline-danger" 
                onClick={() => handleBulkAction('deleteUnverified')}
              >
                ✉️
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
        </div>
        
        <div className="text-muted">
          {selectedUsers.size} user(s) selected
        </div>
      </div>

      {/* User Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th style={{ width: '50px' }}>
                <Form.Check
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Email</th>
              <th onClick={() => handleSort('registrationDate')} style={{ cursor: 'pointer' }}>
                Registration Date {sortField === 'registrationDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('lastLoginTime')} style={{ cursor: 'pointer' }}>
                Last Login {sortField === 'lastLoginTime' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={getUniqIdValue(user)}>
                <td className="text-center">
                  <Form.Check
                    type="checkbox"
                    checked={selectedUsers.has(getUniqIdValue(user))}
                    onChange={() => handleSelectUser(getUniqIdValue(user))}
                  />
                </td>
                <td className="align-middle">{user.name}</td>
                <td className="align-middle">{user.email}</td>
                <td className="align-middle">{formatDate(user.registrationDate)}</td>
                <td className="align-middle">{formatDate(user.lastLoginTime)}</td>
                <td className="align-middle">
                  <span className={`badge bg-${getStatusVariant(user.status)}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
            {sortedUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;
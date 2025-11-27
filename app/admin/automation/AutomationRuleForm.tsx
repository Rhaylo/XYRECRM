'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAutomationRule, updateAutomationRule } from './actions';
import styles from '../admin.module.css';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AutomationRuleFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function AutomationRuleForm({ initialData, isEditing = false }: AutomationRuleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        triggerType: initialData?.triggerType || 'task_created',
        conditions: initialData?.conditions || '{}',
        actions: initialData?.actions || '[]',
    });

    const triggerTypes = [
        { value: 'task_created', label: 'Task Created' },
        { value: 'task_completed', label: 'Task Completed' },
        { value: 'task_overdue', label: 'Task Overdue' },
        { value: 'deal_stage_change', label: 'Deal Stage Changed' },
        { value: 'client_added', label: 'Client Added' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && initialData?.id) {
                await updateAutomationRule(initialData.id, formData);
            } else {
                await createAutomationRule(formData);
            }
            router.push('/admin/automation');
            router.refresh();
        } catch (error) {
            alert('Failed to save rule');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{isEditing ? 'Edit Rule' : 'Create New Rule'}</h2>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rule Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155',
                            backgroundColor: '#0f172a',
                            color: 'white'
                        }}
                        placeholder="e.g., Auto-assign high priority tasks"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155',
                            backgroundColor: '#0f172a',
                            color: 'white',
                            minHeight: '80px'
                        }}
                        placeholder="Describe what this rule does..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Step 1: Choose a Trigger
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                            When should this automation run?
                        </span>
                    </label>
                    <select
                        value={formData.triggerType}
                        onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155',
                            backgroundColor: '#0f172a',
                            color: 'white'
                        }}
                    >
                        <optgroup label="Tasks Section">
                            <option value="task_created">When a Task is Created</option>
                            <option value="task_completed">When a Task is Completed</option>
                            <option value="task_overdue">When a Task is Overdue</option>
                        </optgroup>
                        <optgroup label="Deals Section">
                            <option value="deal_stage_change">When Deal Stage Changes</option>
                        </optgroup>
                        <optgroup label="Clients Section">
                            <option value="client_added">When a New Client is Added</option>
                        </optgroup>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Conditions (JSON)
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                            Define criteria for execution
                        </span>
                    </label>
                    <textarea
                        value={formData.conditions}
                        onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155',
                            backgroundColor: '#0f172a',
                            color: '#a78bfa',
                            fontFamily: 'monospace',
                            minHeight: '120px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Step 2: Assign an Action
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                            What should happen automatically?
                        </span>
                    </label>

                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                        backgroundColor: '#1e293b'
                    }}>
                        <select
                            value={JSON.parse(formData.actions)[0]?.type || ''}
                            onChange={(e) => {
                                const type = e.target.value;
                                let newAction: any = { type };

                                if (type === 'create_task') {
                                    newAction = { type, title: 'New Automated Task', priority: 'Medium' };
                                }

                                if (type === 'update_deal_stage') {
                                    newAction = { type, stage: 'Negotiation' };
                                }

                                if (type === 'send_notification') {
                                    newAction = { type, message: 'Automation triggered!' };
                                }

                                setFormData({ ...formData, actions: JSON.stringify([newAction]) });
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        >
                            <option value="">Select an action...</option>
                            <option value="create_task">Create a Task</option>
                            <option value="update_deal_stage">Update Deal Stage</option>
                            <option value="send_notification">Send Notification</option>
                        </select>

                        {/* Dynamic Fields based on Action Type */}
                        {(() => {
                            try {
                                const actions = JSON.parse(formData.actions);
                                const action = actions[0];
                                if (!action) return null;

                                if (action.type === 'create_task') {
                                    return (
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Task Title</label>
                                                <input
                                                    type="text"
                                                    value={action.title || ''}
                                                    onChange={(e) => {
                                                        const newAction = { ...action, title: e.target.value };
                                                        setFormData({ ...formData, actions: JSON.stringify([newAction]) });
                                                    }}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Priority</label>
                                                <select
                                                    value={action.priority || 'Medium'}
                                                    onChange={(e) => {
                                                        const newAction = { ...action, priority: e.target.value };
                                                        setFormData({ ...formData, actions: JSON.stringify([newAction]) });
                                                    }}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                if (action.type === 'update_deal_stage') {
                                    return (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>New Stage</label>
                                            <select
                                                value={action.stage || ''}
                                                onChange={(e) => {
                                                    const newAction = { ...action, stage: e.target.value };
                                                    setFormData({ ...formData, actions: JSON.stringify([newAction]) });
                                                }}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                                            >
                                                <option value="Lead">Lead</option>
                                                <option value="Contact Made">Contact Made</option>
                                                <option value="Analyzing">Analyzing</option>
                                                <option value="Offer Sent">Offer Sent</option>
                                                <option value="Negotiation">Negotiation</option>
                                                <option value="Under Contract">Under Contract</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </div>
                                    );
                                }

                                if (action.type === 'send_notification') {
                                    return (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Message</label>
                                            <input
                                                type="text"
                                                value={action.message || ''}
                                                onChange={(e) => {
                                                    const newAction = { ...action, message: e.target.value };
                                                    setFormData({ ...formData, actions: JSON.stringify([newAction]) });
                                                }}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                                            />
                                        </div>
                                    );
                                }
                            } catch (e) {
                                return <div style={{ color: '#ef4444' }}>Error parsing action data</div>;
                            }
                        })()}
                    </div>

                    {/* Hidden textarea to maintain compatibility if needed, or just for debug */}
                    <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>Advanced: View JSON</summary>
                        <textarea
                            value={formData.actions}
                            onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#a78bfa',
                                fontFamily: 'monospace',
                                minHeight: '80px',
                                fontSize: '0.75rem'
                            }}
                        />
                    </details>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.btn}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Rule'}
                    </button>
                    <Link href="/admin/automation">
                        <button type="button" className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={18} />
                            Cancel
                        </button>
                    </Link>
                </div>
            </div>
        </form>
    );
}
